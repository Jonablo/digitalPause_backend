import sys
import json
import torch
import torch.nn.functional as F
from transformers import AutoTokenizer, AutoModelForSequenceClassification

# Suppress warnings
import warnings
warnings.filterwarnings("ignore")

def analyze_sentiment(text):
    model_name = "nlptown/bert-base-multilingual-uncased-sentiment"
    
    # Load model and tokenizer
    # Note: In a real production env, this should be a loaded once (service), 
    # not re-loaded on every script call. For now, this suffices for the requirement.
    tokenizer = AutoTokenizer.from_pretrained(model_name)
    model = AutoModelForSequenceClassification.from_pretrained(model_name)

    inputs = tokenizer(text, return_tensors="pt")
    
    with torch.no_grad():
        outputs = model(**inputs)
    
    logits = outputs.logits
    probabilities = F.softmax(logits, dim=1)
    prediction = torch.argmax(probabilities, dim=1).item()
    
    # 0-4 -> 1-5 stars
    stars = prediction + 1
    confidence = probabilities[0][prediction].item()
    
    return {
        "stars": stars,
        "confidence": confidence,
        "original_text": text
    }

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No text provided"}))
        sys.exit(1)
        
    input_text = sys.argv[1]
    try:
        result = analyze_sentiment(input_text)
        print(json.dumps(result))
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)
