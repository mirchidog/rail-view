import json
with open('gares-de-voyageurs.json', 'r') as file:
    data = json.load(file)

unusedKeys = ["libellecourt", "segment_drg", "codeinsee", "codes_uic", "id"]
for x in unusedKeys:
    del data[x]

with open('stationData.json', 'w') as file:
    json.dump(data, file, indent=2)