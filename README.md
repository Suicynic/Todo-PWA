# Todo-PWA

A simple, elegant Progressive Web App (PWA) for managing your to-do list. Built with vanilla HTML, CSS, and JavaScript with full offline support.

## Features

✨ **Add and Manage Tasks** - Quickly add, complete, and delete tasks
💾 **Persistent Storage** - Tasks are saved locally and persist across sessions
📱 **Installable** - Install as a standalone app on any device
🔌 **Offline Support** - Works without an internet connection
🎨 **Modern UI** - Clean, responsive design with smooth animations
🌐 **Cross-Platform** - Works on desktop and mobile devices

## Getting Started

### Running Locally

1. Clone the repository:
```bash
git clone https://github.com/Suicynic/Todo-PWA.git
cd Todo-PWA
```

2. Serve the files using a local web server:
```bash
# Using Python
python -m http.server 8000

# Using Node.js (http-server)
npx http-server -p 8000
```

3. Open your browser and navigate to `http://localhost:8000`

### Installing as PWA

1. Open the app in a compatible browser (Chrome, Edge, Safari, etc.)
2. Click the install button in the address bar
3. The app will be installed and can be launched from your home screen or app menu

## Project Structure

```
Todo-PWA/
├── index.html        # Main HTML structure
├── styles.css        # Styling and animations
├── app.js           # Application logic and localStorage handling
├── sw.js            # Service worker for offline caching
├── manifest.json    # PWA manifest file
├── icon-192.png     # App icon (192x192)
└── icon-512.png     # App icon (512x512)
```

## Technologies Used

- **HTML5** - Semantic markup
- **CSS3** - Modern styling with flexbox, animations, and responsive design
- **JavaScript (ES6+)** - Vanilla JavaScript with classes and modules
- **Service Workers** - For offline functionality and caching
- **Web Storage API** - localStorage for data persistence
- **PWA Manifest** - For app installation and metadata

## Browser Support

This PWA works on all modern browsers that support:
- Service Workers
- localStorage
- ES6+ JavaScript
- Web App Manifest

Tested on: Chrome, Firefox, Safari, Edge

## License

See [LICENSE](LICENSE) file for details.