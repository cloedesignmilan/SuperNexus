import sys

with open('src/components/DynamicShowcase.tsx', 'r') as f:
    lines = f.readlines()

with open('new_data.ts', 'r') as f:
    new_data = f.read()

# find index of const SHOWCASE_DATA = 
start_idx = -1
for i, line in enumerate(lines):
    if line.startswith('const SHOWCASE_DATA ='):
        start_idx = i
        break

end_idx = -1
for i in range(start_idx, len(lines)):
    if lines[i].startswith('export default function DynamicShowcase'):
        end_idx = i - 1
        break

if start_idx != -1 and end_idx != -1:
    with open('src/components/DynamicShowcase.tsx', 'w') as f:
        f.writelines(lines[:start_idx])
        f.write(new_data + '\n')
        f.writelines(lines[end_idx:])
        print("Updated successfully")
else:
    print("Could not find start or end index")

