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
Normally flot draws the x axis at the bottom or top of the graph and the y axis at the left or right. This plugin will draw the axis through the origin
(i.e. 0,0) if that point is somewhere in the middle of the plot. Otherwise it will draw axis at the bottom and left as normal.

usage -
    var options = {
        crossOrigin: true
    };

    $.plot($("#placeholder), [{ data: [...] }}], options);

Individual axis can be turned off by setting crossOrigin to false for that particular axis -

    var options = {
        crossOrigin: true,
        xaxis: {
            crossOrigin: false
        }
    };

Now only the yaxis will be drawn as crossing the origin with the xaxis draw at the top or bottom as normal.
Note: this currently only effects the primary x and y axes. If you have multiple axes, they will not be affected.
*/

(function ($) {
    function init(plot) {
        // initalize needed hooks
        plot.hooks.processOptions.push(processOptions);

        function processOptions(plot, options) {
            if (options.crossOrigin) {
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
        drawAxis(plot, ctx, plot.getAxes().xaxis);
    }

    function drawYAxis(plot, ctx) {
        drawAxis(plot, ctx, plot.getAxes().yaxis);
    }

    function drawAxis(plot, ctx, axis) {
        ctx.save();
        var offset = plot.getPlotOffset();
        var origin = plot.pointOffset({ x: 0, y: 0 });
        var opt = plot.getOptions();
        var height = plot.height();
        var width = plot.width();

        ctx.lineWidth = 1;
        var yloc = yfrom = offset.top;
        var xloc = xfrom = offset.left;
        var yto = offset.top + height;
        var xto = offset.left + width;
        if (axis.direction == "x") {
            yloc = Math.min(Math.max(origin.top, offset.top), plot.height() + offset.top);
            yto = yloc;
        }
        else {
            xloc = Math.min(Math.max(origin.left, offset.left), plot.width() + offset.left);
            xto = xloc;
        }

        // draw axis
        ctx.strokeStyle = opt.grid.borderColor;
        ctx.beginPath();
        ctx.moveTo(xloc, yloc);
        ctx.lineTo(xto, yto);
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
            yto = offset.top + height;
            xto = offset.left + width;
            aPos = axis.p2c(v); // + offset.top;
            if (axis.direction == "x") {
                xfrom = aPos + offset.left;
                xto = xfrom;
            }
            else {
                yfrom = aPos + offset.top;
                yto = yfrom;
            }
            ctx.moveTo(xfrom, yfrom);
            ctx.lineTo(xto, yto);

            // draw labels
            if (!tick.label)
                continue;
            var yOffset = 0;
            for (k = 0; k < tick.lines.length; k++) {
                var line = tick.lines[k];
                var lPos = axis.p2c(tick.v);
                if (opt.grid.borderWidth) {
                    if (lPos == 0) {
                        continue;
                    }
                    if (axis.direction == "x" && lPos == width) {
                        continue;
                    }
                    else if (lPos == height) {
                        continue;
                    }
                }

                var x = xloc - axis.box.padding - line.width;
                var y = yloc + axis.box.padding;

                if (axis.direction == "x") {
                    x = lPos + offset.left - line.width / 2;
                }
                else {
                    y = lPos + offset.top - tick.height / 2;
                }

                if (tick.v == 0) {
                    if (axis.direction == "x") {
                        x -= line.width;
                    }
                    else {
                        if (options.xaxis.crossOrigin && origin.left > offset.left && origin.left < (width + offset.left))
                            continue;
                    }
                }
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
        version: "0.2"
    });
})(jQuery);