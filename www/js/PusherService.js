ng_app.service('PusherService', function(){
    this.pusher = new Pusher('3baaa682d4ac6a04a39b', {
        cluster: 'ap1',
        encrypted: true
    });
    this.channel = null;
});