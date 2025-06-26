// Configuration constants
const ROLLING_AVERAGE_DAYS = 7;

// Utility functions
function parseTime(timeStr) {
    if (!timeStr || timeStr === 'null') return null;
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours + minutes / 60;
}

function calculateTimeDifference(startTime, endTime) {
    if (!startTime || !endTime) return null;
    let diff = endTime - startTime;
    if (diff < 0) diff += 24; // Handle overnight
    return diff;
}

function calculateRollingAverage(data, windowSize) {
    const result = [];
    for (let i = 0; i < data.length; i++) {
        const start = Math.max(0, i - windowSize + 1);
        const window = data.slice(start, i + 1).filter(val => val !== null && !isNaN(val));
        if (window.length > 0) {
            result.push(window.reduce((sum, val) => sum + val, 0) / window.length);
        } else {
            result.push(null);
        }
    }
    return result;
}

function processData(sleepData) {
    const processed = sleepData
        .filter(record => record.complete === true || record.complete === 'True')
        .map(record => {
            const timeInBed = parseTime(record.time_got_into_bed);
            const timeOutOfBed = parseTime(record.time_got_out_of_bed);
            const timeTriedToSleep = parseTime(record.time_tried_to_sleep);
            const finalAwakeningTime = parseTime(record.final_awakening_time);
            const totalAwakeMinutes = record.total_awake_time_mins ? 
                parseInt(record.total_awake_time_mins) : 0;
            const timeToFallAsleepMinutes = record.time_to_fall_asleep_mins ? 
                parseInt(record.time_to_fall_asleep_mins) : null;
            const timeAwakeInBedMinutes = record.time_in_bed_after_final_awakening_mins ?
                parseInt(record.time_in_bed_after_final_awakening_mins) : null;
            
            let totalTimeInBed = null;
            let totalTimeAsleep = null;
            let sleepEfficiency = null;
            
            // Calculate total time in bed
            if (timeInBed !== null && timeOutOfBed !== null) {
                totalTimeInBed = calculateTimeDifference(timeInBed, timeOutOfBed);
            }
            
            // Calculate total time asleep: (wake time - sleep attempt time) - time to fall asleep - time awake during night
            if (timeTriedToSleep !== null && finalAwakeningTime !== null) {
                const sleepPeriod = calculateTimeDifference(timeTriedToSleep, finalAwakeningTime);
                if (sleepPeriod !== null) {
                    const timeToFallAsleepHours = (timeToFallAsleepMinutes || 0) / 60;
                    const totalAwakeHours = totalAwakeMinutes / 60;
                    totalTimeAsleep = sleepPeriod - timeToFallAsleepHours - totalAwakeHours;
                    
                    // Ensure we don't have negative sleep time
                    if (totalTimeAsleep < 0) {
                        totalTimeAsleep = 0;
                    }
                }
            }
            
            // Calculate sleep efficiency
            if (totalTimeAsleep !== null && totalTimeInBed !== null && totalTimeInBed > 0) {
                sleepEfficiency = (totalTimeAsleep / totalTimeInBed) * 100;
            }
            
            return {
                date: record.date,
                totalTimeInBed,
                totalTimeAsleep,
                sleepEfficiency,
                timeToFallAsleepMinutes,
                timeAwakeInBedMinutes
            };
        });
    
    return processed;
}

function formatHoursMinutes(hours) {
    if (hours === null || hours === undefined || isNaN(hours)) {
        return 'N/A';
    }
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}:${m.toString().padStart(2, '0')}`;
}

function createChart(ctx, label, data, rollingAverage, color, isPercentage = false) {
    return new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.map(d => d.date),
            datasets: [
                {
                    label: label,
                    data: data.map(d => d.value),
                    backgroundColor: color + '80',
                    borderColor: color,
                    borderWidth: 1
                },
                {
                    label: `${ROLLING_AVERAGE_DAYS}-Day Rolling Average`,
                    data: rollingAverage,
                    type: 'line',
                    borderColor: '#ff6b6b',
                    backgroundColor: 'transparent',
                    borderWidth: 3,
                    pointRadius: 4,
                    pointBackgroundColor: '#ff6b6b',
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const value = context.parsed.y;
                            if (isPercentage) {
                                return `${context.dataset.label}: ${value.toFixed(1)}%`;
                            } else {
                                return `${context.dataset.label}: ${formatHoursMinutes(value)}`;
                            }
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: '#e0e0e0'
                    },
                    ticks: {
                        callback: function(value) {
                            if (isPercentage) {
                                return value + '%';
                            } else {
                                return formatHoursMinutes(value);
                            }
                        }
                    }
                },
                x: {
                    grid: {
                        color: '#e0e0e0'
                    }
                }
            },
            elements: {
                bar: {
                    borderRadius: 4
                }
            }
        }
    });
}

function createMinuteChart(ctx, label, data, rollingAverage, color) {
    return new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.map(d => d.date),
            datasets: [
                {
                    label: label,
                    data: data.map(d => d.value),
                    backgroundColor: color + '80',
                    borderColor: color,
                    borderWidth: 1
                },
                {
                    label: `${ROLLING_AVERAGE_DAYS}-Day Rolling Average`,
                    data: rollingAverage,
                    type: 'line',
                    borderColor: '#ff6b6b',
                    backgroundColor: 'transparent',
                    borderWidth: 3,
                    pointRadius: 4,
                    pointBackgroundColor: '#ff6b6b',
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const value = context.parsed.y;
                            return `${context.dataset.label}: ${value} minutes`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: '#e0e0e0'
                    },
                    ticks: {
                        callback: function(value) {
                            return value + ' min';
                        }
                    }
                },
                x: {
                    grid: {
                        color: '#e0e0e0'
                    }
                }
            },
            elements: {
                bar: {
                    borderRadius: 4
                }
            }
        }
    });
}

// Load and process data
async function loadData() {
    const response = await fetch('sleep_data.json');
    const sleepData = await response.json();
    
    const processedData = processData(sleepData);
    
    // Prepare data for charts
    const timeInBedData = processedData.map(d => ({
        date: d.date,
        value: d.totalTimeInBed
    })).filter(d => d.value !== null);
    
    const timeAsleepData = processedData.map(d => ({
        date: d.date,
        value: d.totalTimeAsleep
    })).filter(d => d.value !== null);
    
    const efficiencyData = processedData.map(d => ({
        date: d.date,
        value: d.sleepEfficiency
    })).filter(d => d.value !== null);
    
    const fallAsleepData = processedData.map(d => ({
        date: d.date,
        value: d.timeToFallAsleepMinutes
    })).filter(d => d.value !== null);
    
    const awakeInBedData = processedData.map(d => ({
        date: d.date,
        value: d.timeAwakeInBedMinutes
    })).filter(d => d.value !== null);
    
    // Calculate rolling averages
    const timeInBedAvg = calculateRollingAverage(
        timeInBedData.map(d => d.value), 
        ROLLING_AVERAGE_DAYS
    );
    const timeAsleepAvg = calculateRollingAverage(
        timeAsleepData.map(d => d.value), 
        ROLLING_AVERAGE_DAYS
    );
    const efficiencyAvg = calculateRollingAverage(
        efficiencyData.map(d => d.value), 
        ROLLING_AVERAGE_DAYS
    );
    const fallAsleepAvg = calculateRollingAverage(
        fallAsleepData.map(d => d.value), 
        ROLLING_AVERAGE_DAYS
    );
    const awakeInBedAvg = calculateRollingAverage(
        awakeInBedData.map(d => d.value), 
        ROLLING_AVERAGE_DAYS
    );
    
    // Create charts
    const timeInBedCtx = document.getElementById('timeInBedChart').getContext('2d');
    createChart(timeInBedCtx, 'Time in Bed', timeInBedData, timeInBedAvg, '#4fc3f7', false);
    
    const timeAsleepCtx = document.getElementById('timeAsleepChart').getContext('2d');
    createChart(timeAsleepCtx, 'Time Asleep', timeAsleepData, timeAsleepAvg, '#81c784', false);
    
    const efficiencyCtx = document.getElementById('sleepEfficiencyChart').getContext('2d');
    createChart(efficiencyCtx, 'Sleep Efficiency', efficiencyData, efficiencyAvg, '#ffb74d', true);
    
    const fallAsleepCtx = document.getElementById('timeToFallAsleepChart').getContext('2d');
    createMinuteChart(fallAsleepCtx, 'Time to Fall Asleep', fallAsleepData, fallAsleepAvg, '#ba68c8');
    
    const awakeInBedCtx = document.getElementById('timeAwakeInBedChart').getContext('2d');
    createMinuteChart(awakeInBedCtx, 'Time Awake in Bed', awakeInBedData, awakeInBedAvg, '#f06292');
}

// Initialize dashboard
document.addEventListener('DOMContentLoaded', loadData);
