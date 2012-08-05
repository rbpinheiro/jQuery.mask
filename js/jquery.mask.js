/*
 *  Project: jQuery Mask Plugin
 *  Description: Plugin to provide mask functionality to input fields
 *  Author: Rafael Pinheiro (pinheiro.rbp (at) gmail.com)
 *  License: Do what thou wilt shall be the whole of the Law
 */


;(function ( $, window, undefined ) {
    
    var pluginName = 'mask',
        document = window.document,
        defaults = {},
        character_type = {
            SEPARATOR: 0,
            REGULAR: 1
        };

    function Mask( element, mask, options ) {
        this.element = $(element);
        this.mask = mask;
        this.options = $.extend( {}, defaults, options) ;
        
        this._defaults = defaults;
        this._name = pluginName;
        
        this.maskDictionary = {
            '9': '\\d',
            'a': '[a-z\u00E0-\u00FC]',
            'A': '[A-Z\u00C0-\u00DC]',
            '\\*': '.'
        };
        
        this.modifier = 'i';
        
        if (this.options.case_sensitive) {
            this.modifier = '';
        }
        
        this.init();
    }

    Mask.prototype = {
        init: function () {
            this.value = this.element.val();
            this.compileMask();
            this.bindEvents();
        },
        bindEvents: function() {
            var self = this;
            
            this.element.bind('keydown keyup', function() {
                self.applyMask();
            });
        },
        compileMask: function() {
            var temp_mask = [];
            this.separators = '';
            var item;
            var item_type;
            for (var x=0; x<this.mask.length; x++) {
                item = this.mask[x];
                item_type = character_type.SEPARATOR;
                for(var i in this.maskDictionary) {
                    if (item.match(new RegExp(i))) {
                        item = this.maskDictionary[i];
                        item_type = character_type.REGULAR;
                    }
                }
                if (item_type === character_type.SEPARATOR) {
                    this.separators += item;
                }
                temp_mask.push({
                    character: item,
                    type: item_type
                });
            }
            this.compiledMask = temp_mask;
        },
        applyMask: function() {
            if (this.value !== this.element.val()){
                var caretPosition = this.getCaretPosition() + 1;
                var usedSeparators = 0;
                var returnValue = '';
                var value = this.element.val().replace(new RegExp('[' + this.separators + ']', 'g'), '');
                var maskElement;
                var empty = true;
                var index = 0;
                var character;

                for (var i=0; i<this.compiledMask.length && index < value.length; i++) {
                    maskElement = this.compiledMask[i];
                    if (maskElement.type === character_type.SEPARATOR) {
                        returnValue += maskElement.character;
                    } else {
                        character = value[index];
                        index += 1;
                        while (character && !character.match(new RegExp(maskElement.character, this.modifier))) {
                            character = value[index];
                            index += 1;
                        }
                        if (character) {
                            empty = false;
                            returnValue += character;
                        }
                    }
                }
                
                if (empty) {
                    returnValue = '';
                }
                
                this.element.val(returnValue);
                this.value = returnValue;
                
                while (this.compiledMask[caretPosition - 1] && this.compiledMask[caretPosition - 1].type === character_type.SEPARATOR) {
                    caretPosition += 1;
                }
                
                this.setCaretPostion(caretPosition);
                
            }
        },
        getCaretPosition: function () {/*todo: test crossbrowser*/
            //http://stackoverflow.com/a/3373056
            var el = this.element.get(0);
            var start = 0, end = 0, normalizedValue, range,
                textInputRange, len, endRange;

            if (typeof el.selectionStart == "number" && typeof el.selectionEnd == "number") {
                start = el.selectionStart;
                end = el.selectionEnd;
            } else {
                range = document.selection.createRange();

                if (range && range.parentElement() == el) {
                    len = el.value.length;
                    normalizedValue = el.value.replace(/\r\n/g, "\n");

                    // Create a working TextRange that lives only in the input
                    textInputRange = el.createTextRange();
                    textInputRange.moveToBookmark(range.getBookmark());

                    // Check if the start and end of the selection are at the very end
                    // of the input, since moveStart/moveEnd doesn't return what we want
                    // in those cases
                    endRange = el.createTextRange();
                    endRange.collapse(false);

                    if (textInputRange.compareEndPoints("StartToEnd", endRange) > -1) {
                        start = end = len;
                    } else {
                        start = -textInputRange.moveStart("character", -len);
                        start += normalizedValue.slice(0, start).split("\n").length - 1;

                        if (textInputRange.compareEndPoints("EndToEnd", endRange) > -1) {
                            end = len;
                        } else {
                            end = -textInputRange.moveEnd("character", -len);
                            end += normalizedValue.slice(0, end).split("\n").length - 1;
                        }
                    }
                }
            }
            /*
            return {
                start: start,
                end: end
            };
            */
            return start - 1;
        },
        setCaretPostion: function(pos) {/*todo: test crossbrowser*/
            var ctrl = this.element.get(0);
            if(ctrl.setSelectionRange) {
        		ctrl.focus();
        		ctrl.setSelectionRange(pos,pos);
        	} else if (ctrl.createTextRange) {
        		var range = ctrl.createTextRange();
        		range.collapse(true);
        		range.moveEnd('character', pos);
        		range.moveStart('character', pos);
        		range.select();
        	}
        }
    };
    

    
    $.fn[pluginName] = function ( mask, options ) {
        return this.each(function () {
            if (!$.data(this, 'plugin_' + pluginName)) {
                $.data(this, 'plugin_' + pluginName, new Mask( this, mask, options ));
            }
        });
    };

}(jQuery, window));