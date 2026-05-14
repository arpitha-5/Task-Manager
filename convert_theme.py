import os
import glob
import re

def convert_to_light_mode(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Backgrounds
    content = re.sub(r'bg-white/(\d+|\[.*?\])', r'bg-slate-900/\1', content)
    # Borders
    content = re.sub(r'border-white/(\d+|\[.*?\])', r'border-slate-900/\1', content)
    # Text colors
    content = content.replace('text-white', 'text-slate-900')
    content = content.replace('text-slate-200', 'text-slate-800')
    content = content.replace('text-slate-300', 'text-slate-700')
    content = content.replace('text-slate-400', 'text-slate-500')
    # Specific backgrounds
    content = content.replace('bg-[#020617]', 'bg-slate-50')
    content = content.replace('bg-[#06090e]', 'bg-slate-50')
    content = content.replace('bg-slate-800', 'bg-slate-100')
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

def main():
    search_path = os.path.join('frontend', 'src', '**', '*.tsx')
    files = glob.glob(search_path, recursive=True)
    for file in files:
        convert_to_light_mode(file)
        print(f"Converted {file}")

if __name__ == "__main__":
    main()
