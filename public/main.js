var imgNode = document.getElementById("img");
var da;
fetch("/getimage")
    .then((response) => response.json())
    .then((data) => {
        console.log(data);
        imgNode.src = "files/" + data[0];
        if (data.length != 0) {
            fetch("/ai")
                .then((response) => response.json())
                .then((d) => {
                    var s;
                    console.log(d[0][1]);
                    console.log(d[0][2]);
                    if (d[0][1] > d[0][2]) {
                        s = "현무암";
                    } else if (d[0][1] < d[0][2]) {
                        s = "화강암";
                    }

                    var h2Node = document.getElementById("h2");
                    h2Node.textContent = s;
                    console.log(d);
                });
        }
    });
