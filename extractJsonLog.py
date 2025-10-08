import json
import matplotlib.pyplot as plt

daily_values = []
total_values = []
fileName = f'./2025-10-01_20:00:00-2025-10-01_20:00:00.json'
with open(fileName, 'r') as f:
    for l in f.readlines():
        t = l.replace('\n','')[:-1]
        js = json.loads(t)
        daily_values.append(float(js['TODAY_ROI'])*100)
        total_values.append(float(js['TOTAL_ROI'])*100)

x = list(range(1, len(daily_values) + 1))

plt.figure(figsize=(10, 6))
plt.plot(x, daily_values, marker='o', color='blue', label='StepReturn')
plt.plot(x, total_values, marker='s', color='red', label='TotalReturn')

plt.title('Step and Total Return Line Chart')
plt.xlabel('Date')
plt.ylabel('Return(%)')
plt.legend()
plt.grid(True)
plt.show()