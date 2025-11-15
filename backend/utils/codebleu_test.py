# from codebleu import calc_codebleu

# prediction = "def add ( a , b ) :\n return a + b"
# reference = "def sum ( first , second ) :\n return second + first"

# result = calc_codebleu([reference], [prediction], lang="python", weights=(0.15, 0.15, 0.35, 0.35), tokenizer=None)
# print(result)
# {
#   'codebleu': 0.5537, 
#   'ngram_match_score': 0.1041, 
#   'weighted_ngram_match_score': 0.1109, 
#   'syntax_match_score': 1.0, 
#   'dataflow_match_score': 1.0
# }

# backend/utils/codebleu_test.py
from codebleu import calc_codebleu

# Hardcoded reference
REFERENCE_CODE = 'def is_prime(n):\n    if n <= 1:\n        return False\n    if n <= 3:\n        return True\n    if n % 2 == 0 or n % 3 == 0:\n        return False\n    i = 5\n    while i * i <= n:\n        if n % i == 0 or n % (i + 2) == 0:\n            return False\n        i += 6\n    return True\n\nnum = 29\nprint(f"{num} is prime? {is_prime(num)}")'


def evaluate(prediction_code: str) -> float:
    """
    Evaluate a single prediction against the hardcoded reference using CodeBLEU.
    Returns the main CodeBLEU score (float).
    """
    references = [[REFERENCE_CODE]]   # list of list of references
    predictions = [prediction_code]   # list of candidate codes

    # Call CodeBLEU
    result = calc_codebleu(
        references=references,
        predictions=predictions,
        lang="python",
        weights=(0.25, 0.25, 0.25, 0.25),
        tokenizer=None  # or implement custom_tokenizer if needed
    )

    # Return main codebleu score
    if isinstance(result, dict):
        return result.get("codebleu", 0.0)
    else:
        return float(result)
