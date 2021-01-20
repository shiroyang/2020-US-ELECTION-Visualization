let state_id = ["HI", "AK", "FL", "SC", "GA", "AL", "NC", "TN", "RI", "CT", "MA",
    "ME", "NH", "VT", "NY", "NJ", "PA", "DE", "MD", "WV", "KY", "OH",
    "MI", "WY", "MT", "ID", "WA", "DC", "TX", "CA", "AZ", "NV", "UT",
    "CO", "NM", "OR", "ND", "SD", "NE", "IA", "MS", "IN", "IL", "MN",
    "WI", "MO", "AR", "OK", "KS", "LA", "VA"]

let iter = 0; // 用来记录总共渲染的次数，来实现暂停操作
let my_loop = null; // 用来控制 setInterval 函数，控制循环次数
let my_data = null; // 用来读取pre_processed_data.csv的所有记录
let sampleData ={}; // 当次迭代渲染时用到的数据

/************************************** 上面是全局变量 ************************************************/

function state2id(state){

}

function tooltipHtml(n, d){  /* function to create html content string in tooltip div. */
    return "<h4>"+n+"</h4><table>"+
        "<tr><td>Candidate </td><td>"+(d.leading_candidate)+"</td></tr>"+
        "<tr><td>Leading &nbsp;</td><td>"+(d.leading_votes)+"</td></tr>"+
        "<tr><td>Trailing &nbsp;</td><td>"+(d.trailing_votes)+"</td></tr>"+
        "<tr><td>Differential</td><td>"+(d.vote_differential)+"</td></tr>"+
        "<tr><td>Win_Rate</td><td>"+(d.win_rate)  +"</td></tr>"+
        "<tr><td>Remaining </td><td>"+(d.vote_remaining)+"</td></tr>"+
        "</table>";
}

function map_init(){
    state_id
        .forEach(function (d) {
            let leading_candidate = "Nobody";
            let leading_votes = "None";
            let trailing_votes = "None";
            let vote_differential = "None";
            let vote_remaining = "None";
            let win_rate = "None";
            sampleData[d] = {
                leading_candidate: leading_candidate,
                leading_votes: leading_votes,
                trailing_votes: trailing_votes,
                vote_differential: vote_differential,
                vote_remaining: vote_remaining,
                win_rate: win_rate,
                color: "white"
            };

        });
    uStates.draw("#statesvg", sampleData, tooltipHtml);
    d3.select(self.frameElement).style("height", "600px");
}

function draw() {
    // console.log("Now rendering No. %d row data from CSV", iter);
    // 1.渲染右边蓝色区域的时钟
    let current_time = my_data[iter]['ddtt'];
    let clock_time = "Current time:           " + current_time.slice(0,4) + "." + current_time.slice(4,6) + "." + current_time.slice(6, 8) + "       " + current_time.slice(8, 10) + ":" + current_time.slice(10, 12);
    $('#time_title').text(clock_time.replaceAll(" ", '\xA0')); //这里需要把空格转换成16进制的160，代表空格
    //刷新词云
    let filename = current_time.slice(0, 4) + "-" + current_time.slice(4, 6) + "-" + current_time.slice(6, 8);
    d3.select("#wordcloud").attr("src", "wordclouds/" + filename + ".png");
    //刷新评论
    $.getJSON("comment.json", function (result)
    {
        comment = result[filename];
        $("#comments").text(comment);
    })
    // 2.渲染地图的颜色
    let text = "Now rendering " + (iter+2).toString() + "/3406 data";
    $('#rendering_num').text(text);
    d3.selectAll(".state").remove();
    d3.selectAll("g").remove();
    // 选择地图颜色
    let domain = [0, 1];
    let color = d3.scaleQuantize()
        .domain(domain)
        .range(["#3487e0", "#599de5", "#8dbcec", "#b5d2f1", "#eaf1f8", "#f8e5e5", "#f4baba", "#f1a2a1", "#ec7070", "#ea5353"]);

    let item_idx = my_data[iter]['idx'];
    let item_leading_candidate = my_data[iter]['leading_candidate_name'];
    let item_trump_win_rate = my_data[iter]['trump_win_rate_list'];
    let item_leading_candidate_vote = my_data[iter]['leading_candidate_votes'];
    let item_trailing_candidate_vote = my_data[iter]['trailing_candidate_votes'];
    let item_votes_remaining = my_data[iter]['votes_remaining'];
    let item_vote_differential = my_data[iter]['vote_differential'];

    item_trump_win_rate = parseFloat(item_trump_win_rate).toFixed(3); //胜率保留三位小数
    let normal_color = color(item_trump_win_rate);
    // brighter color 使用非线性函数使得颜色更亮丽
    let y1 = Math.sin((item_trump_win_rate - 0.5) * Math.PI);
    let y2;
    if (y1 >= 0)
        y2 = Math.pow(y1, 1/6);
    else y2 = -1 * Math.pow(-1 * y1, 1/6);
    let y = y2 / 2 + 0.5;
    let brighter_color = color(y);

    sampleData[item_idx] ={
        leading_candidate: item_leading_candidate,
        leading_votes: item_leading_candidate_vote,
        trailing_votes: item_trailing_candidate_vote,
        vote_remaining: item_votes_remaining,
        vote_differential: item_vote_differential,
        win_rate: item_trump_win_rate,
        color: brighter_color

    }

    /*
    state_id
        .forEach(function (d) {
            let low = Math.round(100 * Math.random()),
                mid = Math.round(100 * Math.random()),
                high = Math.round(100 * Math.random());
            let leading_candidate;
            if (mid > 50)
                leading_candidate = "Trump"
            else if (mid < 50)
                leading_candidate = "Biden"
            else
                leading_candidate = "Nobody"
            sampleData[d] = {
                low: d3.min([low, mid, high]), high: d3.max([low, mid, high]),
                avg: Math.round((low + mid + high) / 3), leading_candidate: leading_candidate,
                color: color(mid / 100)
            };
            sampleData["HI"].color = "Black";
            console.log(sampleData["HI"]);
        });
     */


    /* 调用uStates.js函数来进行渲染 */
    uStates.draw("#statesvg", sampleData, tooltipHtml);

    d3.select(self.frameElement).style("height", "600px");
    /*进度条刷新*/
    let scale = d3.scaleLinear().domain([0, 3406]).range([0, 100]);
    let progress = $("#progress1");
    progress.val(scale(iter));
    /*********************************** 这部分用来控制循环次数  *********************************************/
    iter += 1; //全局变量用来控制迭代次数
    if (iter > 3405) {
        clearInterval(my_loop);
        $('#rendering_num').text("All Rendered");
    }
}


/*
    数据类型为
    state_clean, trump_win_rate_list, ddtt, leading_candidate_name, trailing_candidate_name, leading_candidate_votes, trailing_candidate_votes, vote_differential
*/

function main(){
    d3.csv(data_file).then(function (DATA){
        my_data = DATA;
        // console.log(my_data.length)
        map_init();
        $("#start").click(function () {
            if (my_loop != null) {
                clearInterval(my_loop);
            }
            my_loop = setInterval(function () {
                draw()
            }, 50);
        })
        $("#stop").click(function () {
            if (my_loop != null) {
                clearInterval(my_loop);
            }
        })
        $("#reset").click(function () {
            clearInterval(my_loop);
            map_init();
            iter = 0;
            my_loop = setInterval(function () {
                draw()
            }, 50);
        })
    })
}


main()