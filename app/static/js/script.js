const get_data = async function(link){
        let words;
        if (window.localStorage.getItem('word_rush_words')){
            words = JSON.parse(window.localStorage.getItem('word_rush_words'))
        }else{
            $.ajax({
                type:"GET",
                url:link,
                async:false,
                success:function(data){
                    words = data;
                    window.localStorage.setItem('word_rush_words', JSON.stringify(data))
                },
                error:function(err){
                    if (err){
                        get_data(link);
                    };

                }
        })}
        console.log(words)
        return words;
    }

const log_score = async function(link){
    $.ajax({
        type:"GET",
        url:link,
        async:false,
        success:function(data){
            console.log("")
        },
        error:function(err){
            console.log('')
        }
        })
    }    

$(function(){
    let words_list = [
        "money",
        "cocktail",
        "house",
        "sacred",
        "catapult",
        "keyboard",
        "laptop",
        "table",
        "horrendous",
        "sugar"
    ]
    const link = 'https://random-word-api.herokuapp.com/all'
    const word = $('#word')
    const c_level = $('#c-level')
    const time_limit = $('#time-limit')
    const best_point = $('#best-point')
    const spinner = $('#spinner')
    const entry = $('#entry')
    const control_but = $('#control-but')
    const time_left = $('#time-left')
    const score = $('#score')
    const switch_h = $('#switch')
    word.html(choose_word())
    
    get_data(link).then(function(val){
        words_list = [...words_list, ...val]
    })
    spinner.hide()


    function choose_word(){
        return words_list[Math.floor(Math.random()*words_list.length)]
    }


    let state_controller = 0;
    let state_over = false;
    let state_running = false;
    let state_millisec_interval = 1000
    let state_time_left = -1
    let state_word_typed = false
    let state_current_score 
    let state_current_level
    let state_current_word
    switch_h.hide()
    initiate()
    var t;

    function initiate(){
        state_current_score = -1
        state_current_level = 0
        state_time_left = -1
        c_level.html(0)
        time_limit.html(0)
        time_left.html(-1)
        score.html(-1)
        best_point.html(JSON.parse(window.localStorage.getItem('word_rush_best_score')) || 0)
    }

    function reset(){
        window.localStorage.setItem('word_rush_best_score',"0")
        initiate()
    }

    function rerender(){
        state_current_score += 1;
        state_word_typed = false;
        entry.val('')
        state_current_level += (state_current_score === Math.floor(state_current_level*1.3))?1:0
        best_score = JSON.parse(window.localStorage.getItem('word_rush_best_score')) || 0
        if ((state_current_score > best_score)){
            log_score(`/log_score/${state_current_score}`)
        }
        window.localStorage.setItem('word_rush_best_score', JSON.stringify((best_score>state_current_score)?best_score:state_current_score))
        state_current_word = choose_word()
        time_left_add = Math.floor(state_current_level / 5) * 2
        state_time_left = 3 + time_left_add
        state_millisec_interval = Math.floor((state_current_word.length/state_current_level)*900)
        c_level.html(state_current_level)
        time_left.html(state_time_left)
        word.html(state_current_word)
        best_point.html(JSON.parse(window.localStorage.getItem('word_rush_best_score')))
        time_limit.html(state_time_left)
        score.html(state_current_score)
        clearInterval(t);
        interval_func();
    }

    function start_game(){
        state_controller = 1;
        control_but.html(control_but.html().replace('Start', "Pause"));
        entry.val('')
        entry.attr('disabled',false)
        state_current_level = 1
        state_current_word = choose_word()
        time_left_add = Math.floor(state_current_level / 5) * 2
        state_time_left = 3 + time_left_add
        state_current_score = 0;
        state_millisec_interval = Math.floor((state_current_word.length/state_current_level)*900)
        state_running = true
        c_level.html(state_current_level)
        time_left.html(state_time_left)
        word.html(state_current_word)
        time_limit.html(state_time_left)
        score.html(state_current_score)
        log_score(`/log_score/${JSON.parse(window.localStorage.getItem('word_rush_best_score')) || 0}`)
        switch_h.hide()
        interval_func();
    }

    

    let interval_func = () => {t = window.setInterval(function(){
        if (state_running){
            if (state_time_left == 1){
                if (state_word_typed){
                    rerender()
                }else{
                    state_running = false;
                    state_over = true;
                    state_controller = -1
                    state_time_left = -1
                    time_left.html(state_time_left)
                    clearInterval(t);
                    control_but.html(control_but.html().replace('Pause', "Game Over"));
                    switch_h.show()
                }
            }else{
                state_time_left -= 1
                time_left.html(state_time_left)
            }
        }
    },state_millisec_interval)}

    entry.on('keypress',function(k){
        if (k.keyCode === 13 && state_running){
            if (entry.val().toLowerCase().replace(" ","") === state_current_word.toLowerCase().replace(" ","")){
                rerender()
            }else{
                state_word_typed = false
                entry.val('')
            }
        }
    })


    entry.on('click', function(e){
        if (state_controller == 0){
            start_game()
        }
    })

    $("#reset").on('click', function(e){
        if (!state_running){
            reset()
        }
    })

    switch_h.on('click', switch_h, function(e){
        console.log('c')
        if (state_controller == -1){
            state_over = false;
            state_controller = 0
            switch_h.hide()
            control_but.html(control_but.html().replace('Game Over', "Start"))
        }else{
            if (state_controller === 2){
                state_controller = 3;
                state_over = true;
                control_but.html(control_but.html().replace('Resume', "Stop"));
            }else if (state_controller ===3){
                state_controller = 2
                control_but.html(control_but.html().replace('Stop', "Resume"));
            }
        }
    })

    control_but.on('click', control_but, function(e){
        if (state_controller == 0){
            start_game()
        }else if (state_controller == 1){
            state_controller = 2;
            state_running = false;
            entry.attr('disabled',true)
            control_but.html(control_but.html().replace('Pause', "Resume"));
            switch_h.show()
        }else if (state_controller == 2){
            state_controller = 1;
            state_running = true
            entry.attr('disabled',false)
            control_but.html(control_but.html().replace('Resume', "Pause"));
            switch_h.hide()
        }else if (state_controller == 3){
            state_controller = -1;
            state_over = true
            state_running = false
            entry.attr('disabled',false)
            clearInterval(t)
            initiate()
            control_but.html(control_but.html().replace('Stop', "Game Over"));
            switch_h.show()
        }
    })
    
})