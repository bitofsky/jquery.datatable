### 소개
DataTable 플러그인은 실시간으로 JavaScript 데이터를 보고, 수정하기 위한 플러그인 입니다.
DataTable 에 집어넣은 데이터를 다단 테이블로 보여줍니다.

수정이 필요한 경우 더블클릭으로 간단하게 데이터를 수정할 수 있고, 수정한 데이터는 별다른 반영 절차 없이 실시간으로 적용 됩니다.

***

### 특징
JavaScript 실행 도중 Private Function Scope(ex. closure) 에 있는 데이터도 실시간 수정이 가능 합니다.
때문에 복잡한 JavaScript 개발 시 매번 Script 수정 -> 새로고침 확인을 할 필요 없이,
미리 걸어둔 DataTable 로 데이터를 확인하고 즉시 수정할 수 있습니다.

***

### 샘플
실제 동작 샘플은 [[여기 JsFiddle]](http://jsfiddle.net/hbsto/uLRGK/) 을 참고 하세요.
```javascript
var data = {

    // Array
    arraaType     : [
        'ArrayIdx 0','ArrayIdx 1','ArrayIdx 2','ArrayIdx 3',
    ],

    // Boolean
    booleanTrue   : true,
    booleanFalse  : false,

    // HTML DOM Elements
    domElement    : document.createElement('textarea'),

    // Function
    functionType  : function(){
        alert('Function!!');
    },

    // jQuery Object
    jqueryObject  : $('<span>Span Tag</span>'),

    // Null
    nullType      : null,

    // Number
    numberType    : 551123.4535,

    // PlainObject
    plainObject   : {
        subkeyA   : 123,
        subkeyB   : 'abc',
        subkeyC   : ['X','Y','Z']
    },

    // String
    stringType    : 'String ABCD',

    // Undefined
    undefinedType : undefined

};

var oDataTable = $.dataTable(data,{modifier:true,keyEdit:true}),
    oButton    = $('<button type=button />').text('Show Current Data').click(function(){
        console.dir(data);
        alert('Executed console.dir(data);\n\nSee debugger or window.data');
    });

window.data = data;

$('BODY').append( oButton, '<br/><br/>', oDataTable );​
```

***

### 필수
1. jQuery 1.4
2. jQUeryUI 1.8
3. HTML5 browser

***

### 서포트 / 지원
사용 중 문의사항은 bitofsky@naver.com 으로 전달해 주시거나 https://github.com/bitofsky/jquery.datatable/issues 에 등록해 주세요.