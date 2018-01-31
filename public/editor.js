window.addEventListener('load', function() {
    var editor;
    editor = ContentTools.EditorApp.get();
    editor.init('*[data-editable]', 'data-name');
    editor.addEventListener('saved', function (ev) {
        var name, payload, regions, xhr;
    
        // Check that something changed
        regions = ev.detail().regions;
        if (Object.keys(regions).length == 0) {
            return;
        }
    
        // Set the editor as busy while we save our changes
        this.busy(true);
    
        // Send the update content to the server to be saved   
        $.ajax({
            method: 'POST',
            url: `/admin/edit2/${pageid}`,
            data: regions
        })
        .done(function(newPage){
            editor.busy(false);
            new ContentTools.FlashUI('ok');
        })
        .fail(function(){
            editor.busy(false);
            new ContentTools.FlashUI('no');
        });
    });    
});