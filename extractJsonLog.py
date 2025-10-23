import json
import matplotlib.pyplot as plt
import argparse
import os

def setupArgParser():
    parser.add_argument("-logpath", type=str, default="", help="")
    return parser

def draw(log_dir, output_dir):
    os.makedirs(os.path.dirname(output), exist_ok=True)
    daily_values = []
    total_values = []
    with open(log_dir, 'r', encoding="utf-8") as f:
        for l in f.readlines():
            t = l.replace('\n','')
            if(t.endswith(',')):
                t = t[:-1]
            try:
                js = json.loads(t)
            except:
                continue
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
    plt.savefig(output_dir)
    #plt.show()
    plt.close()

def checkArgs():
    if(not args.logpath or args.logpath == ""):
        print(f'logpath is empty')
        return False
    return True

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    args, unknown = setupArgParser().parse_known_args()
    output = str(args.logpath).replace('.json', '.png')
    print(f'output: {output}')
    if(checkArgs()):
        draw(log_dir=args.logpath, output_dir=output)
    