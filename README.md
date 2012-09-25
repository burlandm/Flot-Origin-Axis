##Flot Origin Axis
===========
A simple plug in for [Flot](http://www.flotcharts.org/) to draw the axes through the origin when you have data with both negative and positive values.

Note: This plugin will not work with the current stable version of flot (0.7) but should work with any development version after [this commit](https://github.com/flot/flot/commit/4ee1e04e19c739d16a641b1fa224e8f320ad55db) because of the lack of backgroundDraw hooks.

v0.1: Initial version

v0.2: Cleaned up code to remove redundant code. Added border support back. Cleaned up labeling of origin on y-axis when x=0 isn't plotted.