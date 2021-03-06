/**
*  DDCascade - v 1.0.1
*  Small jQuery plugin for creating depended dropdown menus from bas Object
* 
*  Made by Aleksandr Ustinov
*  Under MIT license 
*/
(function ($) {
    /**
    *  Single menu creater
    */
    var Single = {
        constructor :  function(count,insert){
            count = typeof count !== 'undefined' ? count : 0;
            insert = typeof insert !== 'undefined' ? insert : '';
            this.count = count;
            this.insert = insert;
            return this;
        },
        recursiveObjectByCount : function(settings,current,obj,position){
            if(position == this.count){
                Initiate.creatDrop.call(this, settings,current,obj);
                return;
            }
            this.count++;
            var glob = obj[current[this.count - 1]];
            for(var property in glob){
                if (glob.hasOwnProperty(property)) {
                    if (typeof glob[property] == "object") {
                        if(typeof glob[property] !== 'undefined' && property !== settings.sortKey){
                            this.recursiveObjectByCount(settings,current,glob[property],position);
                        }

                    }
                }  
            }       
        }
    };
    /**
    *  Main prototype Class which creating dropdown menus
    *  @count count dropdown menus
    *  @insert append data
    */
    var Initiate = {
        constructor :  function(count,insert){
            count = typeof count !== 'undefined' ? count : 0;
            insert = typeof insert !== 'undefined' ? insert : '';
            this.count = count;
            this.insert = insert;
            return this;
        },
        creatDrop : function(settings,current,obj){
            if(this.count > 0){
                this.insert += settings.delimiter;    
            }console.log(obj);
            this.insert += '<select ';
            if(settings.objectId){
                if(typeof obj[settings.objectId] !== 'undefined'){
                    this.insert += ' id="' + obj[settings.objectId] + '" ';
                }    
            }
            this.insert += settings.idAttribute+'="'+ this.count +'" class="'+settings.innerClass+'">';
            var inner = this;
            $.each(obj[settings.sortKey], function(ind,val){
                inner.insert += '<option value="'+val+'"';
                if(val == current[inner.count]){
                    inner.insert += ' selected="selected" ';    
                }
                if(Object.keys(settings.moreData).length !== 0){
                    for(var property in settings.moreData){
                        if(typeof obj[val][property] !== 'undefined'){
                            inner.insert += ' '+settings.moreData[property]+'="'+obj[val][property]+'" ';  
                        }    
                    }
                }
                //if(settings.moreData.)
                inner.insert += '>' + obj[val][settings.objectShow];
                inner.insert += '</option">';
            });     
            this.insert += '</select>';
        },
        recursiveMoveOverObject : function(settings,obj){
            this.creatDrop(settings,settings.current,obj);
            this.count++; 
            var glob = obj[settings.current[this.count-1]];
            //console.log(glob);
            for(var property in glob){
                if (glob.hasOwnProperty(property)) {
                    if (typeof glob[property] == "object") {
                        if(typeof glob[property] !== 'undefined' && property !== settings.sortKey){
                            this.recursiveMoveOverObject(settings,glob[property]);
                        }
                    }
                }  
            }        
        },
        cleanAppend :  function(){
            this.insert = ''; 
        }
    };   
    /**
    * Prototype Class with current selected items in dropdown groups
    *  @current Current state
    *  @index Index
    */
    var State = {
        constructor :  function(current,index){
            index = typeof index !== 'undefined' ? index : 0;
            current = typeof current !== 'undefined' ? current : [];
            this.index = index;
            this.current = [];
            for(var id in current){
                this.current[id] = current[id];    
            }
            return this;
        },
    }; 
    $.fn.ddcascad = function (callerSettings) {   
        var settings = $.extend({
            current     :  [],     //Preselected    
            innerClass  :  'ddcascad_drop', //selected class
            object      :  {}, //Main Object
            objectId    :  '',
            objectShow  :  'ru', //Object key for options text
            delimiter   :  '',   //Delimiter between selects
            sortKey     :  'sort', //key for sorting array
            idAttribute :  'data-id', //Select id attribute, CAN'T BE SKIPED!
            moreData    :  {}, // Additional data in options
            onLastChoise: function(){}, // Function on last dropdown
            }, callerSettings || {});       
        settings.current = creatSetted(settings.object, settings.current,settings.sortKey);
        var main = this;
        var len = main.length; 
        var state = {}; 
        //Call constructor
        var init = Object.create(Initiate).constructor();
        //Recursivly create dropdown forms
        init.recursiveMoveOverObject(settings,settings.object);

        var Destroy = function(){
            console.log(init);
        } 

        return main.each(function(index,value){
            //Append data in element
            $(this).append(init.insert);
            //Setting current state for dropdowns
            state[index] = Object.create(State).constructor(settings.current,index);
            //Cleaning Append data
            if(len - 1 == index){
                init.cleanAppend();
            }
            //On change events
            $(this).find('select').on('change', function (e) {
                var value = $(this).val();
                // Setting new current for dropdowns
                state[index].current[1*$(this).attr(settings.idAttribute)] = value;
                state[index].current.splice(1*$(this).attr(settings.idAttribute)+1, state[index].current.length);
                state[index].current = creatSetted(settings.object, state[index].current,settings.sortKey);
                // If its last element, run custom function onLastChoise()
                if(state[index].current.length == 1+1*$(this).attr(settings.idAttribute)){
                    if (typeof settings.onLastChoise == 'function') {
                        settings.onLastChoise.call(this, state[index], settings, e);
                    }
                    // Else make new dropdowns menus
                }else{
                    var single;
                    for (var i = 1+1*$(this).attr(settings.idAttribute); i < state[index].current.length; i++) {
                        single = Object.create(Single).constructor();
                        single.recursiveObjectByCount(settings,state[index].current,settings.object,i);
                        $(this).parent().find('select.'+settings.innerClass+'['+settings.idAttribute+'="'+i+'"]').html(single.insert);
                    }    
                }
            });
        });
    };
    /**
    * Function Creat array with selected elements in dropdowns
    */
    var creatSetted = function(obj,stack,sortKey,level){
        level = typeof level !== 'undefined' ? level : 0;
        stack = typeof stack !== 'undefined' ? stack : [];
        for(var property in obj){
            if(obj.hasOwnProperty(property)) {
                if(typeof obj[property] == "object"){
                    if(typeof stack[level] === 'undefined' && property !== 'data'){   
                        stack[level] = property;            
                    }   
                    //console.log(level);
                    if(property === 'data'){                           
                        stack = creatSetted(obj[property], stack, sortKey, level);
                    }else{
                        stack = creatSetted(obj[stack[level]], stack, sortKey, level+1);
                    }                                                        
                }
            }    
        }
        return stack;     
    }; 
})(jQuery); 