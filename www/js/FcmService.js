ng_app.service('FcmService', function(){
    // Initialize Firebase
    this.config = {
        apiKey: "AIzaSyCXWFd--vx5D8x-IkgX6u8ji7ximzYc-wc",
        authDomain: "ervill-2017.firebaseapp.com",
        databaseURL: "https://ervill-2017.firebaseio.com",
        projectId: "ervill-2017",
        storageBucket: "ervill-2017.appspot.com",
        messagingSenderId: "1086333708659"
    };
    this.messaging = null;
    this.init = function(){
        firebase.initializeApp(this.config);
        this.messaging = firebase.messaging();
    };
});