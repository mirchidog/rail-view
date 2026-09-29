import json
with open('gares-de-voyageurs.json', 'r') as file:
    data = json.load(file)

unusedKeys = [2, 3, 5, 6, 7]
for key, value in data:
    value.pop('id', None)

with open('stationData.json', 'w') as file:
    json.dump(data, file, indent=2)