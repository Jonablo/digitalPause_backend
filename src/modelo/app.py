from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch
import torch.nn.functional as F

# 1. Configuración del modelo (Replicación exacta de Hugging Face)
model_name = "nlptown/bert-base-multilingual-uncased-sentiment"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForSequenceClassification.from_pretrained(model_name)

print("--- Modelo cargado y listo ---")

# 2. Bucle para entrada por consola
while True:
    # Pedir la frase al usuario
    text = input("\nEscribe una frase para analizar (o 'salir' para terminar): ")
    
    if text.lower() == 'salir':
        break

    # 3. Tokenización y Predicción
    inputs = tokenizer(text, return_tensors="pt")
    
    with torch.no_grad():
        outputs = model(**inputs)
    
    # 4. Post-procesamiento (Logits -> Probabilidades -> Estrellas)
    logits = outputs.logits
    probabilities = F.softmax(logits, dim=1)
    prediction = torch.argmax(probabilities, dim=1).item()
    
    # El modelo clasifica de 0 a 4, sumamos 1 para el sistema de 1 a 5 estrellas
    stars = prediction + 1
    confidence = probabilities[0][prediction].item()

    print(f"Resultado: {stars} estrellas")
    print(f"Confianza: {confidence:.4f}")
