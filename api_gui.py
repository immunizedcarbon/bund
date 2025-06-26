import tkinter as tk
from tkinter import ttk, scrolledtext, messagebox
import requests
import json
import urllib.parse

BASE_URL = "https://search.dip.bundestag.de/api/v1"

class ApiGui(tk.Tk):
    def __init__(self):
        super().__init__()
        self.title("Bundestag DIP API Client")
        self.geometry("800x600")
        self.create_widgets()

    def create_widgets(self):
        api_frame = ttk.Frame(self)
        api_frame.pack(fill='x', padx=10, pady=5)
        ttk.Label(api_frame, text="API Key:").pack(side='left')
        self.api_entry = ttk.Entry(api_frame, width=60, show='*')
        self.api_entry.pack(side='left', padx=5)

        endpoint_frame = ttk.Frame(self)
        endpoint_frame.pack(fill='x', padx=10, pady=5)
        ttk.Label(endpoint_frame, text="Endpoint path:").pack(side='left')
        self.endpoint_entry = ttk.Entry(endpoint_frame, width=30)
        self.endpoint_entry.pack(side='left', padx=5)
        self.endpoint_entry.insert(0, '/vorgang')

        ttk.Label(endpoint_frame, text="Query (key=value&...):").pack(side='left')
        self.query_entry = ttk.Entry(endpoint_frame, width=40)
        self.query_entry.pack(side='left', padx=5)

        ttk.Button(endpoint_frame, text="Fetch", command=self.fetch).pack(side='left', padx=5)

        self.output = scrolledtext.ScrolledText(self, wrap='word')
        self.output.pack(fill='both', expand=True, padx=10, pady=10)

    def fetch(self):
        api_key = self.api_entry.get().strip()
        if not api_key:
            messagebox.showwarning("API Key missing", "Please enter your API key.")
            return
        endpoint = self.endpoint_entry.get().strip()
        if not endpoint.startswith('/'):
            endpoint = '/' + endpoint
        query_str = self.query_entry.get().strip()
        params = dict(urllib.parse.parse_qsl(query_str, keep_blank_values=True))
        url = BASE_URL + endpoint
        headers = {'Authorization': f'ApiKey {api_key}'}
        try:
            resp = requests.get(url, params=params, headers=headers)
            resp.raise_for_status()
            try:
                data = resp.json()
                text = json.dumps(data, indent=2, ensure_ascii=False)
            except ValueError:
                text = resp.text
            self.output.delete('1.0', tk.END)
            self.output.insert('1.0', text)
        except Exception as exc:
            messagebox.showerror("Request failed", str(exc))

if __name__ == '__main__':
    app = ApiGui()
    app.mainloop()
