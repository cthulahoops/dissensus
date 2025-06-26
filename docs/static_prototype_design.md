# Sleep Metrics Dashboard - Design Overview

## Objective
Create an HTML dashboard to visualize sleep metrics using Chart.js with bar charts and rolling average trend lines for three key metrics:
- Total time in bed
- Total time asleep  
- Sleep efficiency (percentage of time in bed spent asleep)

## Data Processing

### Enhanced Export Script
The `export_sleep_data.py` script has been updated with:
- **Format Options**: `--format/-f` flag supporting `csv` and `json` output
- **Output File**: `--output/-o` flag for custom filenames
- **Auto-detection**: Format detection from file extension when format not specified
- **JSON Export**: Native JSON output preserving data structure for easier JavaScript consumption

### Data Structure
The JSON export provides structured data with key fields:
- `time_got_into_bed` / `time_got_out_of_bed`: Time stamps for bed/wake times
- `total_awake_time_mins`: Minutes spent awake during the night
- `time_in_bed_after_final_awakening_mins`: Minutes in bed after final awakening
- `complete`: Boolean indicating if the record has complete data

## Frontend Implementation

### HTML Structure
- Single-page dashboard with minimal, clean design
- Three chart containers for each metric
- System font stack for consistent appearance
- Responsive layout with max-width container

### CSS Styling
- Clean, minimal design with subtle shadows and rounded corners
- Light gray background with white content area
- Consistent spacing and typography
- Error state styling for debugging

### Chart.js Integration

#### Configuration
- **Rolling Average Window**: Configurable constant `ROLLING_AVERAGE_DAYS = 5`
- **Chart Type**: Bar charts with line overlay for trend
- **Colors**: Distinct colors for each metric (blue, green, orange)

#### Data Processing Functions
1. **`parseTime(timeStr)`**: Converts "HH:MM" to decimal hours
2. **`calculateTimeDifference(start, end)`**: Handles overnight time calculations
3. **`calculateRollingAverage(data, windowSize)`**: Computes rolling averages
4. **`processData(sleepData)`**: Main data transformation pipeline

#### Metrics Calculation
- **Total Time in Bed**: Time difference between getting into and out of bed
- **Total Time Asleep**: Total time in bed minus awake time and post-awakening time
- **Sleep Efficiency**: (Time asleep / Time in bed) × 100

### Features
- **Responsive Design**: Charts adapt to container size
- **Error Handling**: Graceful error display for data loading issues
- **Data Filtering**: Only complete records are included in visualizations
- **Trend Analysis**: 5-day rolling averages provide trend visibility
- **Interactive Charts**: Chart.js provides built-in zoom, hover, and legend interactions

## Usage

### Generate Data
```bash
# Export as JSON (recommended for dashboard)
python3 export_sleep_data.py --format json --output sleep_data.json

# Or let format be auto-detected from filename
python3 export_sleep_data.py --output sleep_data.json
```

### View Dashboard
Open `sleep_dashboard.html` in a web browser. The dashboard will automatically load `sleep_data.json` from the same directory.

## Technical Details

### Rolling Average Implementation
The rolling average uses a sliding window approach:
- Window size configurable via `ROLLING_AVERAGE_DAYS` constant
- Handles missing/null values by filtering them out
- Partial windows (at the beginning of data) still calculate averages

### Data Validation
- Filters incomplete records (`complete !== true`)
- Handles null/missing time values gracefully
- Validates calculated metrics (e.g., negative sleep time)

### Browser Compatibility
- Modern JavaScript (ES6+) with async/await
- Chart.js CDN for broad compatibility
- Standard CSS without vendor prefixes

## Future Enhancements
- Date range filtering
- Additional metrics (sleep onset time, wake frequency)
- Export functionality for charts
- Mobile-optimized responsive design
- Real-time data updates
