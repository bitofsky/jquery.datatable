/**
 * DataTable for JavaScript Data Editing
 *                         jQuery Plugin
 *
 * jQuery 1.4 or higher
 * jQueryUI 1.8 or higher
 *
 * @version 1.0
 * @author bitofsky@neowiz.com 2012.07.13
 * @encoding UTF-8
 */

// http://glat.info/jscheck/
/*global $, jQuery, confirm, console, alert, JSON */

// 명료한 Javascript 문법을 사용 한다.
"use strict";

(function($, window, document){

  var DEFAULT_OPTION = {

    /**
     * @var {boolean} option.modifier=false 데이터 수정 모드 활성화 여부
     */
    'modifier'     : false,

    /**
     * @var {array} option.showPath=[] 보여줄 데이터 경로 명시. 명시된 경로의 데이터 노출.
     */
    'showPath'     : [],

    /**
     * @var {array} option.hidePath=[] 보여주지 않을 데이터 경로 명시. 명시된 경로의 데이터 미노출
     */
    'hidePath'     : [],

    /**
     * @var {string} option.editEvent='dblclick' 셀 에디터 이벤트 설정
     */
    'editEvent'    : 'dblclick',

    /**
     * @var {array} option.editAllowPath=[] 수정할 데이터 경로 명시. 명시된 경로의 데이터에만 수정 기능이 동작.
     */
    'editAllowPath': [],

    /**
     * @var {array} option.editDenyPath=[] 수정을 금지할 데이터 경로 명시. 명시된 경로의 데이터에는 수정 기능이 미동작.
     */
    'editDenyPath' : [],

    /**
     * @var {plainObject} option.pathName={} 경로의 노출 이름을 명시. Key=경로, Value=이름
     */
    'pathName'     : {},

    /**
     * @var {number} option.depth=0 몇 depth 까지 기본 노출할지에 대한 설정. 0은 모두 노출
     */
    'depth'        : 0,

    /**
     * @var {string} option.expandLabel='Detail'
     */
    'expandLabel'  : 'Detail',

    /**
     * @var {string} option.title=null 테이블 상단 제목 caption
     */
    'title'        : null,

    /**
     * @var {boolean} option.keyEdit=false Object/Array 의 서브키를 추가 또는 삭제하는 기능 사용 여부
     */
    'keyEdit'      : false,

    /**
     * @var {boolean} option.html=true String 값으로 들어온 태그를 HTML 로 사용할지 그냥 태그 자체를 보여줄지 설정
     */
    'html'         : true,

    /**
     * @var {boolean} option.allowElement 데이터 중 Element 가 있는 경우 처리 방법. true=append(), false=toString()
     */
    'allowElement' : false,

    'css'          : {
      'table'   : {
        'border-collapse': 'separate',
        'border-spacing' : '5px 0',
        'width'          : '100%'
      },
      'key'     : {
        'padding'        : '0 5px 0 5px',
        'vertical-align' : 'top',
        'text-align'     : 'right',
        'width'          : '1px',
        'white-space'    : 'nowrap'
      }
    }

  };

  var TAG = {
    table    : '<table/>',
    thead    : '<thead/>',
    tbody    : '<tbody/>',
    tr       : '<tr/>',
    td       : '<td/>',
    div      : '<div/>',
    text     : '<input type=text class=ui-state-default />',
    textarea : '<textarea class=ui-state-default />',
    select   : '<select class=ui-state-default />',
    option   : '<option/>',
    number   : '<input type=number class=ui-state-default step=1 min=0 required />',
    button   : '<button type=button />',
    caption  : '<caption/>'
  };

  $.fn.dataTable = function(){
    return this.append( $.dataTable.apply(null, arguments) );
  };

  /**
   * ADM4 DataTable - bitofsky@neowiz.com 2012.07.11 Renewal
   *
   * @param {plainObject|array} data
   * @option {plainObject} option=DEFAULT_OPTION
   */
  $.dataTable = function( data, option, currentDepth, currentPath ){

    // dataTable 은 PlainObject 또는 Array 가 아니면 구성을 할 수 없다.
    if( !checkTableType( data ) ) return null;

    /**
     * @var opt DEFAULT_OPTION
     */
    var opt = $.extend(true, {}, DEFAULT_OPTION, option);

    currentDepth = +currentDepth || 0;
    currentPath  = currentPath || '';

    var table = $( TAG.table ).addClass('ui-tabs ui-widget ui-widget-content ui-corner-all').css( opt.css.table ),
        thead = $( TAG.thead ),
        tbody = $( TAG.tbody );

    if( !opt.depth || opt.depth > currentDepth ){
      renderTable();
    }
    else{

      var tr = $( TAG.tr ).appendTo( tbody ),
          td = $( TAG.td ).appendTo( tr );

      $( TAG.button ).text( opt.expandLabel ).appendTo( td ).click(function(){
        renderTable();
      });
    }

    return table.append( thead, tbody );

    /**
     * DataTable 을 실제로 그리는 기능
     */
    function renderTable(){

      $( thead ).add( tbody ).empty();

      if( opt.title && currentDepth == 0 ){

        $( TAG.caption ).text( opt.title ).addClass('ui-state-default ui-corner-all').appendTo( table );

      }

      // Key 추가 기능 버튼
      if( opt.modifier && opt.keyEdit ){

        $( TAG.tr ).append(
          $( TAG.td ).attr('colspan', 2).append( $( TAG.button ).text('Add Key').button({icons:{primary:'ui-icon-plusthick'}}).click( fn_addKey ) )
        ).appendTo( thead );

      }

      // 각 Key 별 Row 처리
      for( var key in data ){

        // opt.showPath 가 명시된 상태에서 현재 Key 가 리스트에 없는 경우 노출 무시
        if( checkPath('showPath', key) === false ) continue;

        // opt.hidePath 가 명시된 상태에서 현재 Key 가 리스트에 있는 경우 노출 무시
        if( checkPath('hidePath', key) === true ) continue;

        var name = getKeyName( key );

        var tr_line  = $( TAG.tr ).appendTo( tbody ),
            td_key   = $( TAG.td ).text( name ).appendTo( tr_line ).addClass('ui-state-default ui-corner-all').css( opt.css.key ),
            td_value = $( TAG.td ).appendTo( tr_line );

        // value 랜더링
        drawCell( key, td_key, td_value );

      }

    }

    /**
     * Data Key 추가 팝업
     */
    function fn_addKey(){

      var self     = this,
          i_key    = null,
          d_pop    = $( TAG.div ),
          ta_value = $( TAG.textarea ).width('100%');

      if( $.type( data ) == 'array' )
        i_key = $( TAG.number ).val( data.length );
      else
        i_key = $( TAG.text ).attr('required',true);

      d_pop.dataTable({
        'Key Name'     : i_key,
        'Value [Json]' : ta_value
      }, {
        allowElement: true
      }).dialog({
        title: 'Add Key',
        width: 'auto',
        height: 'auto',
        buttons: {
          'Add': function(){

            if( i_key[0].checkValidity && !i_key[0].checkValidity() ) return alert( i_key[0].validationMessage );

            try{
              var value = JSON.parse( ta_value.val() || null );
            }catch( e ){
              return alert( e );
            }

            data[ i_key.val().trim() ] = value;

            d_pop.dialog('close');

            renderTable();

          }
        }

      });

    }

    function fn_delKey( event ){

      var key = event.data;

      if( !confirm('Remove Key - ' + key + '\nContinue?') ) return;

      if( $.type(data) === 'array' ) data.splice(key, 1);
      else delete data[key];

      renderTable();

    }

    /**
     * 값의 유형에 따라 셀을 랜더링 한다.
     * 수정 내역이 Data 에 직접 Set 되려면 참조(refference)를 유지해야 하며 이를 위해 Key 를 받아 내부에서 Data[key] 를 핸들링 함.
     *
     * @param {string|number} key 키 이름
     * @param {jQueryObject} o_key Key TD 객체
     * @param {jQueryObject} o_cell Value TD 객체
     */
    function drawCell( key, o_key, o_cell ){

      var value     = data[key],
          valueType = $.type(value);

      o_key.unbind();

      o_cell.empty();

      // 재귀 DataTable 을 랜더링 한다.
      if( checkTableType( value ) ){

        o_cell.dataTable( value, option, currentDepth+1, currentPath+'.'+key );

      }
      // PlainObject 가 아닌 Object 는 Element 로 본다.
      else if( valueType == 'object' ){

        if( opt.allowElement )
          o_cell.append( value );
        else
          o_cell.text( String(value) );

      }
      // 함수..
      else if( valueType == 'function' ){

        // 줄내림 노출등을 위해 HTML 로 보여줌..
        o_cell.html( nl2br(String(value), true) );

      }
      // 기타 null/undefined/boolean/string/number
      else{

        if( opt.html )
          o_cell.html( nl2br(String(value), true) );
        else
          $('<pre style="margin:0;"/>').html( String(value).replace(/&/g,'&amp;').replace(/</g,'&lt;') ).appendTo( o_cell );

      }

      // 셀 수정 모드 활성화
      if( opt.modifier ) setModifier();

      // 더블클릭으로 데이터를 수정할 수 있도록 한다.
      function setModifier(){

        // opt.editAllowPath 가 명시된 상태에서 현재 Key 가 리스트에 없는 경우 수정 기능 비활성화
        if( checkPath('editAllowPath', key) === false ){
          o_key.addClass('ui-state-disabled');
          return;
        }

        // opt.editDenyPath 가 명시된 상태에서 현재 Key 가 리스트에 있는 경우 수정 기능 비활성화
        if( checkPath('editDenyPath', key) === true ){
          o_key.addClass('ui-state-disabled');
          return;
        }

        o_key.removeClass('ui-state-disabled').bind( opt.editEvent, function(){

          // selection 삭제
          document.getSelection().removeAllRanges();

          var s_type   = $( TAG.select ),
              d_form   = $( TAG.div ),
              b_ok     = $( TAG.button ).text('OK').button().click(function(){
                try{
                  data[key] = fn_val();
                }
                catch( e ){
                  alert( e );
                  return;
                }
                reset();
              }),
              b_cancel = $( TAG.button ).text('Cancel').button().click( reset ),
              b_remove = $( TAG.button ).text('Del Key').button({icons:{primary:'ui-icon-minusthick'}}).click( key, fn_delKey ),
              fn_val   = null;

          o_cell.empty().append( s_type, d_form, b_ok, b_cancel );

          if( opt.keyEdit ) o_cell.append( b_remove );

          ('string number function object array true false null undefined'.split(' ')).forEach(function( v, i ){
            s_type.append(
              $( TAG.option ).val( v ).text( v )
            );
          });

          // 기본 선택
          switch( valueType ){
            case 'boolean': s_type.val( String(value) ); break;
            default       : s_type.val( valueType );
          }

          s_type.change(function(){

            var selectedType = this.value;

            d_form.empty();

            // 선택한 유형이 값과 같은 유형인 경우 기본 데이터 노출
            var def = selectedType == valueType ? String(value) : null;

            switch( true ){

              // 문자형 입력
              case selectedType == 'string':
                var ta_str = $( TAG.textarea ).val( def ).appendTo( d_form ).width('100%');
                fn_val = function(){ return ta_str.val(); };
                break;

              // 숫자형 입력
              case selectedType == 'number':
                var i_number = $( TAG.number ).val( def ).appendTo( d_form ).width('100%');
                fn_val = function(){ return i_number[0].valueAsNumber || 0; };
                break;

              // 함수형 입력. 함수는 특성상 Global scope 를 대상으로 하는 함수만 정의 가능 하다.
              // 기존 함수가 특정 scope 안에서 동작하도록 되어있는 경우 수정으로 인해 오류가 발생할 수 있다.
              case selectedType == 'function':
                var ta_func = $( TAG.textarea ).val( def ).appendTo( d_form ).width('100%');
                fn_val = function(){
                  return new Function( ta_func.val() );
                };
                break;

              // Object 나 Array 는 JSON 입력기를 제공 한다.
              case selectedType == 'object' :
              case selectedType == 'array'  :

                if(
                  (selectedType == 'array'  && valueType == 'array') ||
                  (selectedType == 'object' && $.isPlainObject(value))
                )
                  def = value;
                else
                  def = selectedType == 'object' ? {} : [];

                try{
                  var json = JSON.stringify(def);
                }
                catch( e ){
                  alert( e );
                }

                var ta_array = $( TAG.textarea ).val( json || '' ).appendTo( d_form ).width('100%');

                fn_val = function(){

                  var r = JSON.parse(ta_array.val());

                  if( selectedType == 'object' )
                    return $.isPlainObject(r) ? r : {};
                  else
                    return $.isArray(r) ? r : [];

                };
                break;

              // null undefined false true..
              default: fn_val = function(){ return eval( selectedType ); };

            }

          })

          // set default value
          s_type.change();

        });

      }

      /**
       * 셀 새로 그림
       */
      function reset(){
        drawCell( key, o_key, o_cell );
      }

    }

    function getKeyPath( key ){
      return currentPath+'.'+key;
    }

    function getKeyName( key ){

      var path = getKeyPath( key );

      return opt.pathName[path] || key;

    }

    function checkPath( type, key ){
      var o    = opt[type],
          path = getKeyPath( key );
      if( !o.length ) return undefined;
      for( var i in o ){
        // console.dir( type + ' ? ' + path + ' indexof ' + o[i] + ' = ' + path.indexOf( o[i] ) );
        if( path.indexOf( o[i] ) == 0 ) return true;
      }
      return false;
    }

  };

  /**
   * DataTable 구성에 적합한 데이터인지 확인
   * @param {mixed} data
   * @return {boolean}
   */
  function checkTableType( data ){
    return $.isArray( data ) || $.isPlainObject( data );
  }

  function nl2br( text, whitespace ){
    var str = String(text||'').replace(/\n/g, '<br/>');
    if( whitespace ) str = str.replace(/\s/g, '&nbsp;');
    return str;
  }

  define('jquery.datatable', ['jquery'], function(){ return $.dataTable; });

})(jQuery, this, this.document);
