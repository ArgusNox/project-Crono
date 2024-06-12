// script.js
document.addEventListener("DOMContentLoaded", () => {
    const timerElement = document.getElementById('timer');
    const activityInput = document.getElementById('activity');
    const colorPicker = document.getElementById('colorPicker');
    const savedSegmentsContainer = document.getElementById('saved-segments');
    
    let startTime, updatedTime, difference, tInterval;
    let running = false;
    let segments = [];
    
    const startButton = document.getElementById('start');
    const stopButton = document.getElementById('stop');
    const resetButton = document.getElementById('reset');
    const saveButton = document.getElementById('save');
    
    startButton.addEventListener('click', startTimer);
    stopButton.addEventListener('click', stopTimer);
    resetButton.addEventListener('click', resetTimer);
    saveButton.addEventListener('click', saveSegment);

    function startTimer() {
        if (!running) {
            startTime = new Date().getTime() - (difference || 0);
            tInterval = setInterval(updateTimer, 1000);
            running = true;
        }
    }

    function stopTimer() {
        if (running) {
            clearInterval(tInterval);
            running = false;
        }
    }

    function resetTimer() {
        clearInterval(tInterval);
        running = false;
        difference = 0;
        timerElement.innerHTML = "00:00:00";
    }

    function updateTimer() {
        updatedTime = new Date().getTime();
        difference = updatedTime - startTime;
        
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        
        timerElement.innerHTML = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }

    function saveSegment() {
        const activity = activityInput.value.trim();
        if (!activity || !difference) return;

        const time = timerElement.innerHTML;
        const color = colorPicker.value;
        
        // Guardamos solo si hay una actividad
        segments.push({ time: difference, activity, color });

        saveSegmentsToLocalStorage();
        activityInput.value = '';
        resetTimer(); // Reseteamos el temporizador después de guardar
    }

    function saveSegmentsToLocalStorage() {
        const savedSegments = JSON.parse(localStorage.getItem('segments')) || {};
        const date = new Date().toISOString().split('T')[0];
        if (!savedSegments[date]) savedSegments[date] = [];

        segments.forEach(segment => {
            const existingSegment = savedSegments[date].find(savedSegment => savedSegment.activity === segment.activity);
            if (existingSegment) {
                existingSegment.time += segment.time;
            } else {
                savedSegments[date].push(segment);
            }
        });

        localStorage.setItem('segments', JSON.stringify(savedSegments));
        segments = [];
        displaySavedSegments();
    }

    function displaySavedSegments() {
        savedSegmentsContainer.innerHTML = '';
        const savedSegments = JSON.parse(localStorage.getItem('segments')) || {};
        Object.keys(savedSegments).forEach(date => {
            const dateDiv = document.createElement('div');
            dateDiv.innerHTML = `<h3>${date}</h3>`;
            savedSegmentsContainer.appendChild(dateDiv);

            savedSegments[date].forEach((segment, index) => {
                const segmentDiv = document.createElement('div');
                segmentDiv.className = `segment ${segment.color}`;
                
                // Convertir el tiempo acumulado a formato HH:MM:SS
                const time = convertMsToTime(segment.time);
                segmentDiv.innerHTML = `${time} - ${segment.activity} <button onclick="deleteSegment('${date}', ${index})">Eliminar</button>`;
                
                dateDiv.appendChild(segmentDiv);
            });
        });
    }

    function convertMsToTime(milliseconds) {
        const hours = Math.floor(milliseconds / (1000 * 60 * 60));
        const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }

    window.deleteSegment = function(date, index) {
        const savedSegments = JSON.parse(localStorage.getItem('segments')) || {};
        if (savedSegments[date]) {
            savedSegments[date].splice(index, 1);
            if (savedSegments[date].length === 0) {
                delete savedSegments[date];
            }
            localStorage.setItem('segments', JSON.stringify(savedSegments));
            displaySavedSegments();
        }
    };

    displaySavedSegments();
});
