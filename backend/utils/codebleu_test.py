
# # backend/utils/codebleu_test.py
# from codebleu import calc_codebleu

# # Hardcoded reference
# REFERENCE_CODE = 'def is_prime(n):\n    if n <= 1:\n        return False\n    if n <= 3:\n        return True\n    if n % 2 == 0 or n % 3 == 0:\n        return False\n    i = 5\n    while i * i <= n:\n        if n % i == 0 or n % (i + 2) == 0:\n            return False\n        i += 6\n    return True\n\nnum = 29\nprint(f"{num} is prime? {is_prime(num)}")'


# def evaluate(prediction_code: str) -> float:
#     """
#     Evaluate a single prediction against the hardcoded reference using CodeBLEU.
#     Returns the main CodeBLEU score (float).
#     """
#     references = [[REFERENCE_CODE]]   # list of list of references
#     predictions = [prediction_code]   # list of candidate codes

#     # Call CodeBLEU
#     result = calc_codebleu(
#         references=references,
#         predictions=predictions,
#         lang="python",
#         weights=(0.25, 0.25, 0.25, 0.25),
#         tokenizer=None  # or implement custom_tokenizer if needed
#     )

#     # Return main codebleu score
#     if isinstance(result, dict):
#         return result.get("codebleu", 0.0)
#     else:
#         return float(result)

from codebleu import calc_codebleu
from typing import Optional

# Hardcoded fallback reference
REFERENCE_CODE = '''\
def is_prime(n):
    if n <= 1:
        return False
    if n <= 3:
        return True
    if n % 2 == 0 or n % 3 == 0:
        return False
    i = 5
    while i * i <= n:
        if n % i == 0 or n % (i + 2) == 0:
            return False
        i += 6
    return True

num = 29
print(f"{num} is prime? {is_prime(num)}")'''

def evaluate(prediction_code: str, reference_code: Optional[str] = None) -> float:
    reference = reference_code if reference_code else REFERENCE_CODE
    references = [[reference]]
    predictions = [prediction_code]

    result = calc_codebleu(
        references=references,
        predictions=predictions,
        lang="python",
        weights=(0.25, 0.25, 0.25, 0.25),
        tokenizer=None
    )

    return result.get("codebleu", 0.0) if isinstance(result, dict) else float(result)
