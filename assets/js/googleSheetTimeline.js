// The TL.Timeline constructor takes at least two arguments:
// the id of the Timeline container (no '#'), and
// the URL to your JSON data file or Google spreadsheet.
// the id must refer to an element "above" this code,
// and the element must have CSS styling to give it width and height
// optionally, a third argument with configuration options can be passed.
// See below for more about options.

function getBasicConfig(){
    return {
        yearFrom :1800,
        yearTo : 1900,
        options : {
            timenav_height : 400,
            groups_definition: {
                "Opere": {"rows":1,"index":1},
                "Autori": {"rows":4,"index":2},
                "Periodizzazione": {"rows":2,"index":6},
                "Teorie Economiche": {"rows":3,"index":4},
                "Eventi storici/economici": {"rows":1,"index":3},
                "Eventi storici": {"rows":1,"index":5}
            },
            scale_factor: 0.5,
            duration: 300,
            zoom_sequence: [0.3,0.5, 1, 2, 3, 5, 8]
        },
        gSheetUrl: 'https://docs.google.com/spreadsheets/d/1z-rQsWnvK0likMzZadsSQfW8QRO-mdNt3LAu4-HgyIY/pubhtml',
        selectedGroups: ["Opere","Autori","Teorie Economiche","Periodizzazione","Eventi storici/economici","Eventi storici"]

    
    }
    
}

function setSessionConfig(configJson){
    sessionStorage.setItem("configJson", JSON.stringify(configJson));
}

function getSessionConfig(){
    return JSON.parse(sessionStorage.getItem("configJson"));
}

$(function(){

    // jQuery methods go here...
    
    const urlParams = new URLSearchParams(window.location.search);
    var forceRefresh=urlParams.has('refresh');
    setSessionConfig(getBasicConfig());
    createTimelineFromGoogleSheet(getSessionConfig(),forceRefresh);
   

    // Create a new date from a string, return as a timestamp.
    var dateSlider = document.getElementById('slider-date');

    noUiSlider.create(dateSlider, {
    // Create two timestamps to define a range.
        range: {
            min: -400,
            max: 2025
        },

        connect: [false,true, false],

    // Steps of one year
        step: 100,

    // Two more timestamps indicate the handle starting positions.
        start: [1800, 1900],

    });

    var dateValues = [
        document.getElementById('event-start'),
        document.getElementById('event-end')
    ];
    
    dateSlider.noUiSlider.on('update', function (values, handle) {
        dateValues[handle].innerHTML = parseInt(""+values[handle]);
    });

    function filterTimelineByTimeRange(values, handle, unencoded, tap, positions) {
        // values: Current slider values (array);
        // handle: Handle that caused the event (number);
        // unencoded: Slider values without formatting (array);
        // tap: Event was caused by the user tapping the slider (boolean);
        // positions: Left offset of the handles (array);
        var config = getSessionConfig();
        config.yearFrom = parseInt(""+values[0]);
        config.yearTo = parseInt(""+values[1]);
        setSessionConfig(config);
        createTimelineFromGoogleSheet(config,false);
    }
    
    // Binding signature
    dateSlider.noUiSlider.on('change', filterTimelineByTimeRange);
    

    $(".cGroups").change(function() {
        myArray=[];

        $("input:checkbox[name='acs']:checked").each(function(){
            myArray.push($(this).val());
        });
        
        var config = getSessionConfig();
        config.selectedGroups = myArray;
        setSessionConfig(config);
        createTimelineFromGoogleSheet(config,false);

    });
  
});

//timeline = new TL.Timeline('timeline-embed', gSheetUrl);