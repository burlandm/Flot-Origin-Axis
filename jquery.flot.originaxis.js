/*
 * The MIT License

Copyright (c) 2012 by Matt Burland

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/
/*


*/

(function ($) {
    function init(plot) {
        // initalize needed hooks
        plot.hooks.processOptions.push(processOptions);

        function processOptions(plot, options) {
            if (options.crossOrigin) {
                options.grid.borderWidth = 0;
                if (options.xaxis.crossOrigin) {
                    options.xaxes[0].show = false;
                    options.xaxes[0].reserveSpace = true;
                    plot.hooks.drawBackground.push(drawXAxis);
                }
                if (options.yaxis.crossOrigin) {
                    options.yaxes[0].show = false;
                    options.yaxes[0].reserveSpace = true;
                    plot.hooks.drawBackground.push(drawYAxis);
                }
            }
        }
    }

    function drawXAxis(plot, ctx) {
        ctx.save();
        var offset = plot.getPlotOffset();
        var origin = plot.pointOffset({ x: 0, y: 0 });
        var axis = plot.getAxes().xaxis;
        var opt = plot.getOptions();
   
        ctx.lineWidth = 1;
        var yloc = Math.min(Math.max(origin.top, offset.top),plot.height() + offset.top);

        // draw axis
        ctx.strokeStyle = opt.grid.borderColor;
        ctx.beginPath();
        ctx.moveTo(offset.left, yloc);
        ctx.lineTo(plot.width() + offset.left, yloc);
        ctx.stroke();

        // draw ticks and labels
        var f = axis.font;
        ctx.font = f.style + " " + f.variant + " " + f.weight + " " + f.size + "px " + f.family;
        ctx.textAlign = "start";
        ctx.textBaseline = "middle";
        ctx.fillStyle = axis.options.color;
        ctx.strokeStyle = axis.options.tickColor || $.color.parse(axis.options.color).scale('a', 0.22).toString();
        ctx.beginPath();
        for (i = 0; i < axis.ticks.length; ++i) {
            var tick = axis.ticks[i];
            var v = tick.v;
            if (v < axis.min || v > axis.max)
                continue;
            // draw grid line
            x = axis.p2c(v) + offset.left;
            ctx.moveTo(x, offset.top);
            ctx.lineTo(x, plot.height() + offset.top);

            // draw labels
            if (!tick.label)
                continue;
            var yOffset = 0;
            for (k = 0; k < tick.lines.length; k++) {
                var line = tick.lines[k];
                var x = offset.left + axis.p2c(tick.v) - line.width / 2;
                if (tick.v == 0)
                    x -= line.width;
                y = yloc + axis.box.padding;

                y += line.height / 2 + yOffset;
                yOffset += line.height;

                ctx.fillText(line.text, x, y);
            }
        }
        ctx.stroke();

        ctx.restore();
    }

    function drawYAxis(plot, ctx) {
        ctx.save();
        var offset = plot.getPlotOffset();
        var origin = plot.pointOffset({ x: 0, y: 0 });
        var axis = plot.getAxes().yaxis;
        var opt = plot.getOptions();

        ctx.lineWidth = 1;
        var xloc = Math.min(Math.max(origin.left, offset.left), plot.width() + offset.left);

        // draw axis
        ctx.strokeStyle = opt.grid.borderColor;
        ctx.beginPath();
        ctx.moveTo(xloc, offset.top);
        ctx.lineTo(xloc, plot.height() + offset.top);
        ctx.stroke();

        // draw ticks and labels
        var f = axis.font;
        ctx.font = f.style + " " + f.variant + " " + f.weight + " " + f.size + "px " + f.family;
        ctx.textAlign = "start";
        ctx.textBaseline = "middle";
        ctx.fillStyle = axis.options.color;
        ctx.strokeStyle = axis.options.tickColor || $.color.parse(axis.options.color).scale('a', 0.22).toString();
        ctx.beginPath();
        for (i = 0; i < axis.ticks.length; ++i) {
            var tick = axis.ticks[i];
            var v = tick.v;
            if (v < axis.min || v > axis.max) {
                continue;
            }
            y = axis.p2c(v) + offset.top;
            ctx.moveTo(offset.left, y);
            ctx.lineTo(plot.width() + offset.left, y);

            // draw labels
            if (!tick.label)
                continue;
            var yOffset = 0;
            for (k = 0; k < tick.lines.length; k++) {
                var line = tick.lines[k];
                var y = offset.top + axis.p2c(tick.v) - tick.height / 2;
                if (tick.v == 0) {
                    if (options.xaxis.crossOrigin)
                        continue;
                    y += line.height;
                }
                x = xloc - axis.box.padding - line.width;

                y += line.height / 2 + yOffset;
                yOffset += line.height;

                ctx.fillText(line.text, x, y);
            }
        }
        ctx.stroke();

        ctx.restore();
    }

    var options =
        {
            crossOrigin: false,
            xaxis: {
                crossOrigin: true
            },
            yaxis: {
                crossOrigin: true
            }
        };       // any needed options

    $.plot.plugins.push({
        init: init,
        options: options,
        name: "originAxis",
        version: "0.1"
    });
})(jQuery);