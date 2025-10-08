fileName = 'webLog/0709-bull.txt'
out_path = fileName.split('.')[0] + '.out'
out = open(out_path, 'w+')
with open(fileName, 'r') as f:
    for l in f.readlines():
        if l.startswith('Daily Return:'):
            out.write(f'Daily: {float(l.split()[2]):.3f}\n')
        elif l.startswith('Total Return:'):
            out.write(f'Total: {float(l.split()[2]):.3f}\n')
out.flush()
out.close()


import matplotlib.pyplot as plt

daily_values = []
total_values = []

with open(out_path, 'r') as file:
    for line in file.readlines():
        if line.startswith('Daily:'):
            daily_values.append(float(line.split(':')[1].strip()))
        elif line.startswith('Total:'):
            total_values.append(float(line.split(':')[1].strip()))

x = list(range(1, len(daily_values) + 1))

plt.figure(figsize=(10, 6))
plt.plot(x, daily_values, marker='o', color='blue', label='Daily')
plt.plot(x, total_values, marker='s', color='red', label='Total')

plt.title('Daily and Total Line Chart')
plt.xlabel('Data Point Index')
plt.ylabel('Value')
plt.legend()
plt.grid(True)
plt.show()