from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer, util
import spacy

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)
nlp = spacy.load("en_core_web_sm")
embedder = SentenceTransformer('all-MiniLM-L6-v2')

class TextInput(BaseModel):
    text: str

@app.get("/hello")
def hello():
    return {"message": "Hello from NLP service"}

@app.post("/analyze/clauses")
def split_clauses(input: TextInput):
    doc = nlp(input.text)
    clauses = []
    for i, sent in enumerate(doc.sents):
        clean_text = sent.text.strip()
        if len(clean_text) > 15:  # skip tiny fragments/junk
            clauses.append({
                "clauseNumber": i + 1,
                "text": clean_text
            })
    return {"totalClauses": len(clauses), "clauses": clauses}
VAGUE_TERMS = {
    "may": 2, "reasonable": 3, "reasonably": 3, "appropriate": 3,
    "adequate": 3, "adequately": 3, "if necessary": 3, "as necessary": 2,
    "should": 2, "could": 1, "where appropriate": 3, "from time to time": 2,
    "as appropriate": 3, "best efforts": 2, "commercially reasonable": 3,
    "at its discretion": 3, "without limitation": 2, "generally": 1
}

@app.post("/analyze/ambiguity")
def score_ambiguity(input: TextInput):
    text_lower = input.text.lower()
    doc = nlp(input.text)
    token_count = len([t for t in doc if not t.is_punct and not t.is_space])

    matched = []
    weight_sum = 0
    for term, weight in VAGUE_TERMS.items():
        if term in text_lower:
            matched.append(term)
            weight_sum += weight

    density = (weight_sum / max(token_count, 10)) * 100  # floor of 10 tokens avoids short-sentence spikes
    density = round(min(density, 100), 2)

    return {
        "ambiguityScore": density,
        "matchedTerms": matched
    }
REQUIRED_SECTIONS = {
    "Data Collection": ["collect", "gather", "obtain information"],
    "Data Sharing": ["share", "third party", "third-party", "partners"],
    "Data Retention": ["retain", "retention", "how long", "storage period"],
    "User Rights": ["right to", "access", "delete", "deletion", "correct"],
    "Data Breach Notification": ["breach", "notify", "notification", "incident"],
    "Contact Information": ["contact", "email us", "reach us", "questions"],
    "Policy Changes": ["modify", "change this policy", "update this policy", "amend"],
    "Security Measures": ["security", "protect", "safeguard", "encryption"]
    }
@app.post("/analyze/completeness")
def check_completeness(input: TextInput):
    text_lower = input.text.lower()
    present = []
    missing = []

    for section, keywords in REQUIRED_SECTIONS.items():
        found = any(keyword in text_lower for keyword in keywords)
        if found:
            present.append(section)
        else:
            missing.append(section)

    completeness_score = round((len(present) / len(REQUIRED_SECTIONS)) * 100, 2)

    return {
        "completenessScore": completeness_score,
        "presentSections": present,
        "missingSections": missing
    }
class ClauseListInput(BaseModel):
    clauses: list[str]

NEGATION_WORDS = ["not", "no", "never", "cannot", "won't", "shall not", "will not", "except", "excluding"]

@app.post("/analyze/duplicates")
def find_duplicates(input: ClauseListInput):
    clauses = input.clauses
    if len(clauses) < 2:
        return {"pairs": []}

    embeddings = embedder.encode(clauses, convert_to_tensor=True)

    # Extract key content words per clause (nouns/verbs, not stopwords)
    def key_words(text):
        doc = nlp(text)
        return set(t.lemma_.lower() for t in doc if t.pos_ in ("NOUN", "VERB", "PROPN") and not t.is_stop)

    keyword_sets = [key_words(c) for c in clauses]
    pairs = []

    for i in range(len(clauses)):
        for j in range(i + 1, len(clauses)):
            similarity = util.cos_sim(embeddings[i], embeddings[j]).item()

            shared = keyword_sets[i] & keyword_sets[j]
            union = keyword_sets[i] | keyword_sets[j]
            overlap = len(shared) / len(union) if union else 0

            text_i_neg = any(neg in clauses[i].lower() for neg in NEGATION_WORDS)
            text_j_neg = any(neg in clauses[j].lower() for neg in NEGATION_WORDS)

            is_related = similarity > 0.75 or (similarity > 0.45 and overlap > 0.25)

            if is_related:
                relation_type = "contradiction" if (text_i_neg != text_j_neg) else "duplicate"
                pairs.append({
                    "clauseIndex1": i, "clauseIndex2": j,
                    "similarity": round(similarity, 3),
                    "keywordOverlap": round(overlap, 3),
                    "type": relation_type
                })

    return {"pairs": pairs}
MODAL_STRENGTH = {
    "shall": "mandatory", "must": "mandatory", "will": "mandatory",
    "should": "recommended", "may": "discretionary", "can": "discretionary",
    "could": "discretionary"
}

@app.post("/analyze/obligations")
def extract_obligations(input: TextInput):
    doc = nlp(input.text)
    obligations = []

    for sent in doc.sents:
        sent_doc = sent.as_doc()
        for token in sent_doc:
            # Look for modal verbs (auxiliary verbs like shall/must/should/may)
            if token.pos_ == "AUX" and token.lemma_.lower() in MODAL_STRENGTH:
                # Find the main verb this modal is attached to
                main_verb = token.head

                # Find the subject of that main verb
                subject = None
                for child in main_verb.children:
                    if child.dep_ in ("nsubj", "nsubjpass"):
                        subject = child

                if subject is not None:
                    # Expand subject to include compound words (e.g. "Data Protection Officer")
                    subject_span = sent_doc[subject.left_edge.i : subject.right_edge.i + 1].text
                    obligations.append({
                        "responsibleEntity": subject_span,
                        "modal": token.text,
                        "strength": MODAL_STRENGTH[token.lemma_.lower()],
                        "action": main_verb.lemma_,
                        "sourceClause": sent.text.strip()
                    })

    return {"totalObligations": len(obligations), "obligations": obligations}