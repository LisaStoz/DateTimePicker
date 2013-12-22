/*
 * DateTimePicker - v0.0 by Lisa Stoz
 * Under MIT Licence
 * built from jQuery Boilerplate - v3.3.1
 * http://jqueryboilerplate.com made by Zeno Rocha under MIT License
 */
;
(function($, window, document, undefined) {

    var pluginName = "dateTimePicker",
            defaults = {
                'buttonUp': '<span></span>',
                'buttonDown': '<span></span>',
				'buttonClass': '',
                'dayFormat': 'D MMMM YYYY',
				'minuteStep': 5,
				'hourStep': 1,
				'dayStep': 1,
				'noPast': false,
                'emptyOnLoad': false,
				'wrapperClass': '',
				'position': 'bottom',
				'amFormat': '',
				'monthNames': [
					"January", "February", "March", "April", "May", "June", "July",
					"August", "September", "October", "November", "December"
				],
				'monthShortNames': [
					"Jan", "Feb", "Mar", "Apr", "May", "Jun",
					"Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
				],
				'hourFormat': 'HH',
                'minuteFormat': 'mm',
				'clearButton': '&times;'
            };


    function Plugin(element, options) {
        this.element = element;
        this.settings = $.extend({}, defaults, options);
        this._defaults = defaults;
        this._name = pluginName; 
        this.fullFormat = '';
        this.dateTime;
        this.dateTimeParts = []; 
        this.separators = {
            'dayHourSep': ' ',
			'hourMinuteSep': ':',
			'minuteAmSep': ' '
        };        
        this.init();
    }

    Plugin.prototype = {
        init: function() {
            var _self = this;
            
            _self.adjustSettings();
            _self.calculateTime();
            _self.buildHTML();
            _self.bindEvents();
        },
        adjustSettings: function() {
            var _self = this;                        
			
            /* override months with user-specified values */
			moment.lang('en', {
				months : _self.settings['monthNames'],
				monthsShort: _self.settings['monthShortNames']
			});
            
            /* if am/pm is used - then switch to 12-hour format */
			if ( (_self.settings['amFormat'] === 'a') || (_self.settings['amFormat'] === 'A') ) {
				_self.settings['hourFormat'] = 'hh';
			}
			
			/* clear separators if time is disabled */
			if ( (_self.settings['hourFormat'] === '') && (_self.settings['minuteFormat'] === '') ) {
				_self.separators['dayHourSep'] = '';
				_self.separators['hourMinuteSep'] = '';
				_self.separators['minuteAmSep'] = '';
			}
			
            /* construct full date and time format */			
            _self.fullFormat = _self.settings['dayFormat']+_self.separators['dayHourSep']+_self.settings['hourFormat']+_self.separators['hourMinuteSep']+_self.settings['minuteFormat']+_self.separators['minuteAmSep']+_self.settings['amFormat'];		            			            			
        },
        calculateTime: function() {
            var _self = this;              
            
            if ($(_self.element).val() > '') {
				// construct datetime from currently entered data
                _self.dateTime = moment($(_self.element).val(), _self.fullFormat, 'en'); 
            }
            else {
				// by default (nothing entered in a text field) set datetime to now
                _self.dateTime = moment();
            }
            
            /* round date and time according to step values provided */
            _self.dateTime.minutes(Math.round(_self.dateTime.minute()/_self.settings['minuteStep'])*_self.settings['minuteStep']);
			_self.dateTime.hours(Math.round(_self.dateTime.hour()/_self.settings['hourStep'])*_self.settings['hourStep']);
			_self.dateTime.date(Math.round(_self.dateTime.date()/_self.settings['dayStep'])*_self.settings['dayStep']);
						
        },
        buildHTML: function(){
            var _self = this;      
            
            /* main datetime field should not be editable */
            $(_self.element).attr('readonly', 'readonly');
            
            /* find out which datetime parts are used */            
			if (_self.settings['dayFormat'] > '') {
				_self.dateTimeParts.push('day');
			}
			if (_self.settings['hourFormat'] > '') {
				_self.dateTimeParts.push('hour');
			}
			if (_self.settings['minuteFormat'] > '') {
				_self.dateTimeParts.push('minute');
			}
			if (_self.settings['amFormat'] > '') {
				_self.dateTimeParts.push('am');
			}
			var enabledFieldClass = '';
			for (var counter in _self.dateTimeParts) {
				enabledFieldClass = enabledFieldClass + _self.dateTimeParts[counter][0];
			}            
                        
            /* wrap whole datetimepicker in a container */
			$(_self.element).wrap('<div class="datetimepicker-wrapper datetimepicker-'+enabledFieldClass+' datetimepicker-' + _self.settings['position'] + ' ' + _self.settings['wrapperClass'] +' "></div>');
			/* hidden field to store the format, useful for server-side when form submitted */
			$(_self.element).closest('.datetimepicker-wrapper').append('<input type="hidden" name="'+$(_self.element).attr('name')+'_format" value="'+_self.fullFormat+'"/>');
			/* clear button */
			if (_self.settings['clearButton'] > '') {
				$(_self.element).closest('.datetimepicker-wrapper').append('<a href="#" class="datetimepicker-clear">'+_self.settings['clearButton']+'</a>');
			}
			/* construct date timepicker popup */
            $(_self.element).closest('.datetimepicker-wrapper').append('\
			<div class="datetimepicker-container">\
			<div class="datetimepicker-arrow"><div class="arrow-inner"></div></div>\
			<div class="datetimepicker-main">');
			for (counter in _self.dateTimeParts) {
				var dateTimePart = _self.dateTimeParts[counter];               
				var dateTimePartNext = _self.dateTimeParts[parseInt(counter)+1];                
				if (dateTimePart === 'am') {
					var activeAM = 'datetimepicker-disabled';
					var activePM = '';
					if (_self.dateTime.hour() >= 12 ) {
						activeAM = '';
						activePM = 'datetimepicker-disabled';
					}
					var AMPM = ['AM', 'PM'];
					if (_self.settings['amFormat'] === 'a') {
						AMPM = ['am', 'pm'];
					}
					$(_self.element).closest('.datetimepicker-wrapper').find('.datetimepicker-main').append('<span class="datetimepicker-'+dateTimePart+'">\
                    <a href="#" class="datetimepicker-btn-am '+activeAM+' '+defaults['buttonClass']+'">'+AMPM[0]+'</a>\
                    <a href="#" class="datetimepicker-btn-pm '+activePM+' '+defaults['buttonClass']+'">'+AMPM[1]+'</a>\
					</span>');
				}
				else {
					$(_self.element).closest('.datetimepicker-wrapper').find('.datetimepicker-main').append('<span class="datetimepicker-'+dateTimePart+'">\
                    <a href="#" class="datetimepicker-up '+_self.settings['buttonClass']+'">'+_self.settings['buttonUp']+'</a>\
                    <input type="text" name="datetimepicker-'+dateTimePart+'" autocomplete="off"/>\
                    <a href="#" class="datetimepicker-down '+_self.settings['buttonClass']+'">'+_self.settings['buttonDown']+'</a>\
					</span>');
				}
				
				if (counter < (_self.dateTimeParts.length - 1)) {
					$(_self.element).closest('.datetimepicker-wrapper').find('.datetimepicker-main').append('\
					<span class="datetimepicker-'+dateTimePart+'-'+dateTimePartNext+'-sep">'+_self.separators[dateTimePart+dateTimePartNext.charAt(0).toUpperCase() + dateTimePartNext.slice(1)+'Sep']+'</span>');
				}
			}
			/* populate all fields with correct date and time values */
            _self.formatFields();
            
            /* first load already happened, after the first user interaction with the field it is not empty any more */
            _self.settings['emptyOnLoad'] = false;			                       
            
        },
        bindEvents: function() {
            var _self = this;
            _self.clearBtn();
            _self.popupOpen();
            _self.popupBlur();
            _self.upBtn();
            _self.downBtn();
            _self.amBtn();
            _self.pmBtn();
            _self.preventInput();
            _self.typeDateTime();
        },
        clearBtn: function() {
            var _self = this;
            $(_self.element).closest('.datetimepicker-wrapper').find('.datetimepicker-clear').click(function(e){
                e.preventDefault();
				$(_self.element).val('');
				$(this).addClass('datetimepicker-hidden');				
			});
        },
        upBtn: function() {
            var _self = this;
            $(_self.element).closest('.datetimepicker-wrapper').find('.datetimepicker-up').each(function(){
				$(this).click(function(e){
                    e.preventDefault();
					var datetimePart = $(this).closest('span').attr('class').substring(15);
					_self.dateTime.add(datetimePart+'s', _self.settings[datetimePart+'Step']);	
					_self.formatFields();
					$(_self.element).closest('.datetimepicker-wrapper').find('.datetimepicker-'+datetimePart+' .datetimepicker-down').removeClass('datetimepicker-disabled');					
				});
			});
        },
        downBtn: function() {
            var _self = this;
            $(_self.element).closest('.datetimepicker-wrapper').find('.datetimepicker-down').each(function(){
				$(this).click(function(e){
                    e.preventDefault();
					var datetimePart = $(this).closest('span').attr('class').substring(15);
					if (!$(this).hasClass('datetimepicker-disabled')) {
						_self.dateTime.subtract(datetimePart+'s', _self.settings[datetimePart+'Step']);
						_self.formatFields();
					}					
				});
			
			});
        },
        amBtn: function() {
            var _self = this;
            $(_self.element).closest('.datetimepicker-wrapper').find('.datetimepicker-btn-am').click(function(e){
                e.preventDefault();
				if ( !$(this).hasClass('datetimepicker-disabled') ) {
					if (_self.setting['noPast']) {
						var datetimeCopy = _self.dateTime.clone();
						datetimeCopy.subtract('hours', 12);
						if (datetimeCopy.isBefore(moment(), 'minute')) {
							_self.dateTime.add('hours', 12);
							$(_self.element).closest('.datetimepicker-wrapper').find('.datetimepicker-hour .datetimepicker-down').removeClass('datetimepicker-disabled');
							$(_self.element).closest('.datetimepicker-wrapper').find('.datetimepicker-minute .datetimepicker-down').removeClass('datetimepicker-disabled');
						}
						else {
							_self.dateTime.subtract('hours', 12);	
						}
					}
					else {
						_self.dateTime.subtract('hours', 12);
					}
					_self.formatFields();
					$(this).addClass('datetimepicker-disabled');
					$(_self.element).closest('.datetimepicker-wrapper').find('.datetimepicker-btn-pm').removeClass('datetimepicker-disabled');
				}
				return false;
			});
        },
        pmBtn: function() {
            var _self = this;
            $(_self.element).closest('.datetimepicker-wrapper').find('.datetimepicker-btn-pm').click(function(e){
                e.preventDefault();
				if ( !$(this).hasClass('datetimepicker-disabled') ) {
					_self.dateTime.add('hours', 12);
					_self.formatFields();
					$(this).addClass('datetimepicker-disabled');
					$(_self.element).closest('.datetimepicker-wrapper').find('.datetimepicker-btn-am').removeClass('datetimepicker-disabled');
					$(_self.element).closest('.datetimepicker-wrapper').find('.datetimepicker-hour .datetimepicker-down').removeClass('datetimepicker-disabled');
					$(_self.element).closest('.datetimepicker-wrapper').find('.datetimepicker-minute .datetimepicker-down').removeClass('datetimepicker-disabled');
				}				
			});
        },
        preventInput: function() {
            var _self = this;
            $(_self.element).bind('keyup paste input', function(){
				_self.formatFields();
			});
        },
        typeDateTime: function() {
            var _self = this;
            
            // text fields in the popup - allowed to type/paste date/time 
			var datetimePart;
			$(_self.element).closest('.datetimepicker-wrapper').find('.datetimepicker-container input').bind('keyup paste input', function(){
				datetimePart = $(this).closest('span').attr('class').substring(15);
                _self.validateInput(datetimePart, $(this));				
			});
			
			// when finished typing/pasting the date/time - apply changes to the main field 
			$(_self.element).closest('.datetimepicker-wrapper').find('.datetimepicker-container input').bind('change', function(){
				datetimePart = $(this).closest('span').attr('class').substring(15);
				if (datetimePart === 'day') {
					if (!moment($(_self.element).val(), _self.settings['dayFormat'], 'en').isValid()) {
						$(this).val(_self.dateTime.format(_self.settings[datetimePart+'Format']));
					}
					else if ( (_self.settings['noPast']) && (_self.isPast(datetimePart )) ) {
						// when noPast allowed and enter datetime is in the past - reset to default
						$(this).val(_self.dateTime.format(_self.settings[_self.dateTimePart+'Format']));
					}
					else {
						var datetimeCopy = moment($(this).val(), _self.fullFormat, 'en');
						_self.dateTime.date(datetimeCopy.date());
						_self.dateTime.month(datetimeCopy.month());
						_self.dateTime.year(datetimeCopy.year());
					}
				}
				else {
					if ( (_self.settings['noPast']) && (_self.isPast(datetimePart )) ) {
						// when noPast allowed - validate if entered datetime is in past
						$(this).val(_self.settings.format(defaults[datetimePart+'Format']));
					}
					else {
						_self.dateTime[datetimePart]($(this).val());
					}
				}
				_self.formatFields();
			});
        },
        popupBlur: function(){
            var _self = this;
            // while tabbing - last item in a popup blurred
			$(_self.element).closest('.datetimepicker-wrapper').find('.datetimepicker-down:last').blur(function(){
                $(_self.element).closest('.datetimepicker-wrapper').removeClass('open');
            });
            
            // hide datetimepicker when clicked outside      
            $('html').bind('click', function(e){
                var dontTriggerHiding = $(_self.element);
                dontTriggerHiding = dontTriggerHiding.add($(_self.element).closest('.datetimepicker-wrapper').find('.datetimepicker-container').find('*'));
                if ( !$(e.target).is(dontTriggerHiding) ) {
                    $(_self.element).closest('.datetimepicker-wrapper').removeClass('open');
                }
			});
        },
        popupOpen: function() {
            var _self = this;
            
            // showing/hiding the popup 
            var datetimeFieldClicked = false;
            $(_self.element).mousedown(function(){
                datetimeFieldClicked = true;
            });
            
            $(_self.element).bind('focus click', function(e) {
                if (e.type === 'click') { //always toggle datetimepicker on click
					if ($(_self.element).val() === '') {
						_self.formatFields();
					}
                    $(_self.element).closest('.datetimepicker-wrapper').toggleClass('open');
                    datetimeFieldClicked = false;
                }
                else {
                    if (!datetimeFieldClicked) {
						// focus gained using tab, not click - only open poup if it is closed
                        if (!$(_self.element).closest('.datetimepicker-wrapper').hasClass('open')) {
                            $(_self.element).closest('.datetimepicker-wrapper').addClass('open');
                        }   
                    }
                }
            });
        },        
        formatFields: function() {
            var _self = this;
            for (var counter in _self.dateTimeParts) {
                if (_self.dateTimeParts[counter] !== 'am') {
                    $(_self.element).closest('.datetimepicker-wrapper').find('.datetimepicker-'+_self.dateTimeParts[counter]+' input').val(_self.dateTime.format(_self.settings[_self.dateTimeParts[counter]+'Format']));
                }
            }

            if (_self.settings['noPast']) {
                var datetimeCopy;
                for (counter in _self.dateTimeParts) {
                    if ( _self.dateTimeParts[counter] !== 'am') {
                        datetimeCopy = _self.dateTime.clone();
                        datetimeCopy.subtract(_self.dateTimeParts[counter]+'s', _self.settings[_self.dateTimeParts[counter]+'Step']);
                        if (datetimeCopy.isBefore(moment(), 'minute')) {
                            $(_self.element).closest('.datetimepicker-wrapper').find('.datetimepicker-'+_self.dateTimeParts[counter]+' .datetimepicker-down').addClass('datetimepicker-disabled');
                        }
                        else {
                            $(_self.element).closest('.datetimepicker-wrapper').find('.datetimepicker-'+_self.dateTimeParts[counter]+' .datetimepicker-down').removeClass('datetimepicker-disabled');
                        }	
                    }
                }
            }

            // if not requested to leave target field empty on load - populate datetime
            if (!_self.settings['emptyOnLoad']) {
                var formatted_val = _self.dateTime.format(_self.fullFormat);
                $(_self.element).val(formatted_val);
            }

            $(_self.element).closest('.datetimepicker-wrapper').find('.datetimepicker-clear').removeClass('datetimepicker-hidden');
        },
        isPast: function(dateTimePart) {
            var _self = this;
            var datetimeCopy = _self.dateTime.clone();
            datetimeCopy[dateTimePart](value);
            return datetimeCopy.isBefore(moment(), 'minute');
        },
        validateInput: function(dateTimePart, field) {
            var _self = this;
            if (dateTimePart === 'minute') {
                if ( (! /^([0-5]?[0-9]?)$/.test(field.val()) )  ) {
                    field.val(_self.dateTime.format(_self.settings[dateTimePart+'Format']));
                    return false;
                }
            }
            else if (dateTimePart === 'hour') {
                if ( (! /^([0-1]?[0-9]?|2?[0-3]?)?$/.test(field.val()) ) ) {
                    field.val(_self.dateTime.format(_self.settings[dateTimePart+'Format']));
                    return false;
                }
            }

            return true;
        }
    };

    $.fn[ pluginName ] = function(options) {
        return this.each(function() {
            if (!$.data(this, "plugin_" + pluginName)) {
                $.data(this, "plugin_" + pluginName, new Plugin(this, options));
            }
        });
    };

})(jQuery, window, document);