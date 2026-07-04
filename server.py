from flask import Flask, request, jsonify, send_file
import json
import os

app = Flask(__name__)
DATA_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'data')

@app.route('/')
def index():
    return send_file('index.html')

@app.route('/<path:path>')
def static_files(path):
    return send_file(path)

@app.route('/data/<filename>')
def get_data(filename):
    filepath = os.path.join(DATA_DIR, filename)
    if os.path.exists(filepath) and filename.endswith('.json'):
        with open(filepath, 'r', encoding='utf-8') as f:
            return jsonify(json.load(f))
    return jsonify({'error': 'Not found'}), 404

@app.route('/api/save', methods=['POST'])
def save_data():
    data = request.get_json()
    files = data.get('files', {})
    results = {}
    for filename, content in files.items():
        if not filename.endswith('.json'):
            results[filename] = {'error': 'Invalid filename'}
            continue
        filepath = os.path.join(DATA_DIR, filename)
        try:
            with open(filepath, 'w', encoding='utf-8') as f:
                json.dump(content, f, ensure_ascii=False, indent=2)
            results[filename] = {'success': True}
        except Exception as e:
            results[filename] = {'error': str(e)}
    return jsonify({'results': results})

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 10000))
    app.run(host='0.0.0.0', port=port)
