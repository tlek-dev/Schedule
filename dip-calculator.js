document.addEventListener('DOMContentLoaded', () => {
    // Initialize DIP switches
    const switchesContainer = document.getElementById('dipSwitches');
    for (let i = 0; i < 10; i++) {
        const dipSwitch = document.createElement('div');
        dipSwitch.className = 'dip-switch';
        dipSwitch.dataset.position = i;
        dipSwitch.addEventListener('click', toggleSwitch);
        switchesContainer.appendChild(dipSwitch);
    }

    // Add event listeners
    document.getElementById('dmxAddress').addEventListener('input', validateAndCalculate);
    document.getElementById('calculateDip').addEventListener('click', calculateFromAddress);

    // Initial calculation
    calculateFromAddress();
});

function toggleSwitch(event) {
    const dipSwitch = event.target;
    dipSwitch.classList.toggle('on');
    calculateFromSwitches();
}

function validateAndCalculate(event) {
    const input = event.target;
    const value = input.value;
    
    // Allow empty input
    if (value === '') {
        clearAllSwitches();
        updateBinaryDisplay();
        return;
    }

    let numValue = parseInt(value);
    
    if (isNaN(numValue)) {
        input.value = '';
        clearAllSwitches();
    } else if (numValue < 1) {
        input.value = '1';
        calculateDipSwitches(1);
    } else if (numValue > 512) {
        input.value = '512';
        calculateDipSwitches(512);
    } else {
        calculateDipSwitches(numValue);
    }
}

function clearAllSwitches() {
    const switches = document.querySelectorAll('.dip-switch');
    switches.forEach(dipSwitch => {
        dipSwitch.classList.remove('on');
    });
}

function calculateFromAddress() {
    const addressInput = document.getElementById('dmxAddress');
    const value = addressInput.value;
    
    if (value === '') {
        clearAllSwitches();
        updateBinaryDisplay();
        return;
    }

    const address = parseInt(value) || 1;
    calculateDipSwitches(address);
}

function calculateFromSwitches() {
    const switches = document.querySelectorAll('.dip-switch');
    let address = 0;
    
    switches.forEach((dipSwitch, index) => {
        if (dipSwitch.classList.contains('on')) {
            address += Math.pow(2, 9 - index); 
        }
    });

    // Update address input and binary display
    const addressInput = document.getElementById('dmxAddress');
    if (address >= 1 && address <= 512) {
        addressInput.value = address;
        updateBinaryDisplay();
    } else {
        // Reset switches to previous valid state
        const currentValue = addressInput.value;
        if (currentValue === '') {
            clearAllSwitches();
        } else {
            calculateDipSwitches(parseInt(currentValue) || 1);
        }
    }
}

function calculateDipSwitches(address) {
    // Convert to binary and pad to 10 bits without subtracting 1
    const binary = address.toString(2).padStart(10, '0');
    
    // Update switches
    const switches = document.querySelectorAll('.dip-switch');
    switches.forEach((dipSwitch, index) => {
        // 
        if (binary[index] === '1') {
            dipSwitch.classList.add('on');
        } else {
            dipSwitch.classList.remove('on');
        }
    });

    updateBinaryDisplay();
}

function updateBinaryDisplay() {
    const switches = document.querySelectorAll('.dip-switch');
    let binary = '';
    
    // 
    Array.from(switches).forEach((dipSwitch) => {
        binary += dipSwitch.classList.contains('on') ? '1' : '0';
    });
    
    document.getElementById('binaryValue').textContent = binary;
}
