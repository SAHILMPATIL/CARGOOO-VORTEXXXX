# CargoVortex Cargo Input Application

A modern, AI-powered cargo input interface for the CargoVortex optimization system.

## Features

- **Interactive Data Table**: Easy-to-use Handsontable interface for cargo data entry
- **AI-Powered Suggestions**: Get intelligent suggestions for cargo properties
- **Real-time Validation**: Instant feedback on data quality
- **Import/Export**: Support for CSV and Excel files
- **Dark/Light Theme**: Toggle between themes for comfortable viewing
- **Local Storage**: Automatic saving of your work

## Getting Started

### Prerequisites

- Python 3.6+ (for local server)
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection (for CDN resources and AI features)

### Running the Application

1. **Navigate to the Input_page directory**:
   ```bash
   cd "path/to/CargoVortex_TGB/Input_page"
   ```

2. **Start a local server**:
   ```bash
   python -m http.server 3000
   ```

3. **Open in browser**:
   - Visit `http://localhost:3000`
   - Or open `index.html` directly in your browser

### Using the Application

#### Basic Data Entry
1. Click on any cell in the table to start entering cargo data
2. Required fields are marked with an asterisk (*)
3. Use Tab or Enter to navigate between cells
4. Click "Add Row" to add more cargo items

#### AI Features
- **Auto-suggestions**: When you enter a cargo name, AI will suggest properties
- **AI Fill**: Use the "AI Fill Missing Fields" button for bulk suggestions
- **Validation**: AI provides intelligent validation beyond basic rules

#### Import/Export
- **Import**: Click "Upload CSV/Excel" to import existing data
- **Export**: Use the Review tab to export your data as Excel or CSV

#### Keyboard Shortcuts
- **Ctrl+Z**: Undo
- **Ctrl+Y**: Redo
- **Delete**: Clear selected cells

## File Structure

```
Input_page/
├── index.html          # Main HTML file
├── css/
│   └── styles.css      # Custom styling
└── js/
    ├── init.js         # Initialization and error handling
    ├── config.js       # Configuration settings
    ├── ai-service.js   # AI integration
    ├── table-manager.js # Table functionality
    ├── export-service.js # Import/export features
    └── main.js         # Main application logic
```

## Configuration

### AI Settings
Edit `js/config.js` to modify:
- API keys and endpoints
- Confidence thresholds
- Validation rules

### Styling
Modify `css/styles.css` for:
- Color themes
- Layout adjustments
- Custom styling

## Dependencies

- **Handsontable** (v13.1.0): Data grid component
- **Bootstrap** (v5.3.0): UI framework
- **SweetAlert2** (v11): Beautiful alerts
- **SheetJS** (v0.18.5): Excel file handling
- **Font Awesome** (v6.4.0): Icons

## Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## Troubleshooting

### Common Issues

1. **Table not loading**:
   - Check browser console for errors
   - Ensure all CDN resources are loading
   - Try refreshing the page

2. **AI suggestions not working**:
   - Check internet connection
   - Verify API key in config.js
   - Check browser console for API errors

3. **Import/Export issues**:
   - Ensure file format is CSV or Excel
   - Check file permissions
   - Try with a smaller file first

### Development Mode

For debugging, open browser developer tools and check the console for error messages.

## License

This project is part of the CargoVortex system. See the main project for licensing information.
