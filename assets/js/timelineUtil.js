function createTimelineFromGoogleSheet(config,forceRefresh){
    var timelineJson;
    if(!forceRefresh){
        // Retrieve from cache
        timelineJson = window.timelineJson;
        //JSON.parse(sessionStorage.getItem("timelineJson")); //something is not working with the parsing...
    }

    var needsRefresh = timelineJson==null||forceRefresh;

    if(needsRefresh){
        //this is async
        TL.ConfigFactory.makeConfig(config.gSheetUrl,processConfigJson)
    }else{
        processConfigJson(timelineJson,true,config);
    }
    
}

function processConfigJson(timelineJson,skipStoringInSession,config){
    // Store the json retrieved from gSheet
    if(!skipStoringInSession){
        window.timelineJson=timelineJson;
    }
    if(!config){
        config = getSessionConfig(); //function should be defined in the caller .js
    }
    instantiateTimeline(timelineJson,config.options,config.yearFrom,config.yearTo,config.selectedGroups);
}

function instantiateTimeline(configJson,options,yearFrom,yearTo,selectedGroups){
    
    var finalJson = filterTimeline(configJson,yearFrom,yearTo,selectedGroups);
    //var finalJson = configJson;
    new TL.Timeline('timeline-embed', finalJson, options);
}



function filterTimeline(json,yearFrom,yearTo,selectedGroups){
    var newEvents=[];
    json.events.forEach((el, index) => {
        if(selectedGroups.includes(el.group)){
            let newEvent = isInTimeRange(el,yearFrom,yearTo);
            if(newEvent){
                newEvents.push(newEvent);
            }
        }
    });

    var newEras=[];
    
    json.eras.forEach((el, index) => {
        if(isInTimeRange(el,yearFrom,yearTo)){
            let newEra = isInTimeRange(el,yearFrom,yearTo);
            if(newEra){
                newEras.push(newEra);
            }
        }
    });

    var newJson = {
        title: json.title,
        scale: json.scale,
        events: newEvents,
        eras: newEras,
        event_dict: json.event_dict,
        messages: json.messages,
    };

    return newJson;
}

//If not in timerange return null, otherwise return the modified obj
function isInTimeRange(el,yearFrom,yearTo){
    let start_date_year = el.start_date.data.year;
            
    if(el.end_date==null){
        //This is a single event
        if(start_date_year >= yearFrom &&
            start_date_year <= yearTo){
            return el;
        }
    }else{
        let end_date_year = el.end_date.data.year;
        if(start_date_year < yearTo &&
            end_date_year > yearFrom){
            
            const updateStartDate = yearFrom>start_date_year;
            const updateEndDate = yearTo<end_date_year;
            if(updateEndDate||updateStartDate){
                //Since I want to change the element I will clone it, otherwise the obj in memory will change too
                var newEl = iterationCopy(el);
                if(yearFrom>start_date_year){
                    let newStartYear = Math.max(start_date_year,yearFrom);
                    newEl.start_date = createTL_Date("human",newStartYear,el.start_date.data.month,el.start_date.data.day);
                }else if(yearTo<end_date_year){
                    let newEndYear = Math.min(end_date_year,yearTo);
                    newEl.end_date = createTL_Date("human",newEndYear,el.end_date.data.month,el.end_date.data.day);
                }
                return newEl;
            }else{
                return el;
            }
        }
    }
    return null;
}

//Changing the date means I need to re-run some logic...
function createTL_Date(scale,year,month,day) {
    var dateCls = TL.DateUtil.SCALE_DATE_CLASSES[scale];
    
    var dateObj =  {
        "year": year,
        "month": month,
        "day": day
    }

    return new dateCls(dateObj);
}

//This is just a 1 level iteration... I am aware
function iterationCopy(src) {
    let target = {};
    for (let prop in src) {
      if (src.hasOwnProperty(prop)) {
        target[prop] = src[prop];
      }
    }
    return target;
  }
