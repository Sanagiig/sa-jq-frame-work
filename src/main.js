requirejs.config({
    // baseUrl:'src/js',
    paths:{
      '_t':"src/js/test"
    },
    shim:{
        '_t':{
            deps:[],
            exports:'test'
        }
    }
});

require(['_t'],function(t){
    console.log(t);
})