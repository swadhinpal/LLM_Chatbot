import sacrebleu

def evaluate(reference_code, candidate_code):
    """
    Compute BLEU score between reference and candidate code strings.
    Both inputs should be strings.
    """
    # SacreBLEU expects:
    # candidate: list of strings
    # references: list of list of strings
    candidates = [candidate_code]
    references = [[reference_code]]

    bleu = sacrebleu.corpus_bleu(candidates, references)
    return bleu.score

if __name__ == "__main__":
    # Demo
    reference = "def add(a, b):\n    return a + b"
    candidate = "def add(x, y):\n    return x + y"

    score = evaluate(reference, candidate)
    print(f"CodeBLEU score (approximated using BLEU): {score:.2f}")
