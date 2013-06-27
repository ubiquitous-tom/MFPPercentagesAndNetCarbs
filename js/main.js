var cal_index, carbs_index, fiber_index, fat_index, protien_index, t_cal, t_carbs, t_fiber, t_fat, t_protein, tt_carbs, tt_fiber, tt_fat, tt_protein;

function lgInit() {
	var tRatio = jQuery('<div/>').attr('id','today-ratio');
	jQuery('#content').append(tRatio);
    get_table_column();
    recalculate_remaining();
    add_net_carb_column();
    get_total_today_macro();
    get_total_percentage();
    make_pie_chart();
}

function get_table_column() {
    cal_index = jQuery('table').find('td:contains("Calories")').index();
    carbs_index = jQuery('table').find('td:contains("Carbs")').index();
    fiber_index = jQuery('table').find('td:contains("Fiber")').index();
    fat_index = jQuery('table').find('td:contains("Fat")').index();
    protein_index = jQuery('table').find('td:contains("Protein")').index();
}

function recalculate_remaining() {
    var total_cal = parseInt(jQuery('.total:eq(0)').find('td:eq('+cal_index+')').text().replace(/\s/g, "").replace(",", ""), 10);
    var total_carbs = parseInt(jQuery('.total:eq(0)').find('td:eq('+carbs_index+')').text().replace(/\s/g, "").replace(",", ""), 10);
    var total_fat = parseInt(jQuery('.total:eq(0)').find('td:eq('+fat_index+')').text().replace(/\s/g, "").replace(",", ""), 10);
    var total_protein = parseInt(jQuery('.total:eq(0)').find('td:eq('+protein_index+')').text().replace(/\s/g, "").replace(",", ""), 10);

    var total_alt_cal = parseInt(jQuery('.total.alt:eq(0)').find('td:eq('+cal_index+')').text().replace(/\s/g, "").replace(",", ""), 10);
    var total_alt_carbs = parseInt(jQuery('.total.alt:eq(0)').find('td:eq('+carbs_index+')').text().replace(/\s/g, "").replace(",", ""), 10);
    var total_alt_fat = parseInt(jQuery('.total.alt:eq(0)').find('td:eq('+fat_index+')').text().replace(/\s/g, "").replace(",", ""), 10);
    var total_alt_protein = parseInt(jQuery('.total.alt:eq(0)').find('td:eq('+protein_index+')').text().replace(/\s/g, "").replace(",", ""), 10);

    // var before_class_cal = jQuery('.total:eq(0)').find('td:eq('+cal_index+')').attr('class');
    // var before_class_carbs = jQuery('.total:eq(0)').find('td:eq('+carbs_index+')').attr('class');
    // var before_class_fat = jQuery('.total:eq(0)').find('td:eq('+fat_index+')').attr('class');
    // var before_class_protein = jQuery('.total:eq(0)').find('td:eq('+protein_index+')').attr('class');
    var remaining_cal_class, remaining_carbs_class, remaining_fat_class, remaining_protein_class;
    var remaining_cal = parseInt(total_alt_cal, 10)-parseInt(total_cal, 10); if (remaining_cal >= 0) { remaining_cal_class = 'positive'; } else { remaining_cal_class = 'negative'; }
    var remaining_carbs = parseInt(total_alt_carbs, 10)-parseInt(total_carbs, 10); if (remaining_carbs >= 0) { remaining_carbs_class = 'positive'; } else { remaining_carbs_class = 'negative'; }
    var remaining_fat = parseInt(total_alt_fat, 10)-parseInt(total_fat, 10); if (remaining_fat >= 0) { remaining_fat_class = 'positive'; } else { remaining_fat_class = 'negative'; }
    var remaining_protein = parseInt(total_alt_protein, 10)-parseInt(total_protein, 10); if (remaining_protein >= 0) { remaining_protein_class = 'positive'; } else { remaining_protein_class = 'negative'; }
    jQuery('.total.remaining')
    .find('td:eq('+cal_index+')').removeClass().addClass(remaining_cal_class).text(remaining_cal).end()
    .find('td:eq('+carbs_index+')').removeClass().addClass(remaining_carbs_class).text(remaining_carbs).end()
    .find('td:eq('+fat_index+')').removeClass().addClass(remaining_fat_class).text(remaining_fat).end()
    .find('td:eq('+protein_index+')').removeClass().addClass(remaining_protein_class).text(remaining_protein);
}

function add_net_carb_column() {

    jQuery('table').find('td:contains("Carbs")').before(jQuery('<td />').addClass('alt net-carbs').html('Net<br>Carbs'));
    jQuery('colgroup').find('col:eq('+carbs_index+')').before(jQuery('<col />').addClass('col-2'));
    //jQuery('tfoot').find(':contains("Carbs")').before(jQuery('<td />').addClass('alt').html('Net<br>Carbs'));
    //jQuery('tr.bottom, tr.total').each(function(index, el) {
    jQuery('tbody tr').not('.meal_header,.spacer').each(function(index, el) {
        var carbs_text = jQuery(el).find('td:eq('+carbs_index+')').text();
        var fiber_text = jQuery(el).find('td:eq('+fiber_index+')').text();
        var carbs = 0, fiber = 0, net_carbs = 0;
        var class_name = jQuery(el).attr('class');
        switch (class_name) {
            case 'total':
                var total_net_carbs = 0;
                jQuery('.bottom .net_carbs').each(function(){
                    total_net_carbs += (jQuery(this).text().trim().length === 0)?0:parseInt(jQuery(this).text(), 10);
                });
                jQuery(el).find('td').eq(carbs_index).before(jQuery('<td/>').addClass('total_net_carbs').text(total_net_carbs));
                break;
            case 'total alt':
                jQuery(el).find('td').eq(carbs_index).before(jQuery('<td/>').addClass('goal_net_carbs').text(jQuery(el).find('td').eq(carbs_index).text()));
                break;
            case 'total remaining':
                var remaining = jQuery('.goal_net_carbs').text()-jQuery('.total_net_carbs').text();
                var remaining_class = 'positive';
                if (remaining < 0) remaining_class = 'negative';
                jQuery(el).find('td').eq(carbs_index).before(jQuery('<td/>').addClass('remaining_net_carbs '+remaining_class).text(jQuery(el).find('td').eq(carbs_index).text()));
                jQuery('.remaining_net_carbs').text(remaining);
                break;
            default:
                carbs = carbs_text;
                fiber = fiber_text;
                if (carbs_text.trim().length === 0 || fiber_text.trim().length === 0) {
                    net_carbs = '';
                } else {
                    net_carbs = carbs-fiber;
                }
                //if (net_carbs == 0) net_carbs = '';
                jQuery(el).not('.total alt,.total remaining').find('td:eq('+carbs_index+')').before(jQuery('<td />').addClass('net_carbs').text(net_carbs));
        }
    });

}

function get_total_percentage() {
	var all_bottoms = jQuery('tr.bottom, .total:not(.remaining)');

	all_bottoms.each(function(ind, el) {
		var tr_carbs = jQuery(this).find('td').eq(carbs_index);
		var tr_fat = jQuery(this).find('td').eq(fat_index+1);
		var tr_protein = jQuery(this).find('td').eq(protein_index+1);

		var carb_cals = (tr_carbs.html() * 4);
		var protein_cals = (tr_protein.html() * 4);
		var fat_cals = (tr_fat.html() * 9);
		// console.log(carb_cals, protein_cals, fat_cals);

		var real_cals = carb_cals + protein_cals + fat_cals;

		var carb_pct = (carb_cals / real_cals).toFixed(2) * 100;
		var fat_pct = (fat_cals / real_cals).toFixed(2) * 100;
		var protein_pct = (protein_cals / real_cals).toFixed(2) * 100;

		carb_pct = Math.round(carb_pct);
		fat_pct = Math.round(fat_pct);
		protein_pct = Math.round(protein_pct);

		jQuery(this).find('td').append(jQuery('<div />').addClass('myfp_us').css({color:'#0a0','font-size':'9px','text-align':'center'}).html('&nbsp;'));

		if(!isNaN(carb_pct)) {tr_carbs.find('.myfp_us').text(carb_pct+'%');}
		if(!isNaN(fat_pct)) {tr_fat.find('.myfp_us').text(fat_pct+'%');}
		if(!isNaN(protein_pct)) {tr_protein.find('.myfp_us').text(protein_pct+'%');}
	});
}

function get_total_today_macro() {
    tt_carbs = parseInt(jQuery('.total_net_carbs').text(), 10);
    tt_fat = parseInt(jQuery('tr.total').find('td').eq(fat_index+1).text(), 10);
    tt_protein = parseInt(jQuery('tr.total').find('td').eq(protein_index+1).text(), 10);
}

function make_pie_chart() {
    var t = Raphael("today-ratio"),
        pie = t.piechart(120, 140, 100, [tt_protein*4, tt_carbs*4, tt_fat*9], {
            legend: ["%%.%% ("+tt_protein+") - Protein", "%%.%% ("+tt_carbs+") - Net Carbs", "%%.%% ("+tt_fat+") - Fat"],
            colors: ["#E48701", "#A5BC4E", "#1B95D9"],
            matchColors: true,
            legendpos: "east",
            defcut: true
            //href: ["http://raphaeljs.com", "http://g.raphaeljs.com"]
        });

    t.text(120, 10, "Daily Totals by Calories").attr({ font: "12px sans-serif" });
    pie.hover(function () {
        this.sector.stop();
        this.sector.scale(1.1, 1.1, this.cx, this.cy);

        if (this.label) {
            this.label[0].stop();
            this.label[0].attr({ r: 7.5 });
            this.label[1].attr({ "font-weight": 800 });
        }
    }, function () {
        this.sector.animate({ transform: 's1 1 ' + this.cx + ' ' + this.cy }, 500, "bounce");

        if (this.label) {
            this.label[0].animate({ r: 5 }, 500, "bounce");
            this.label[1].attr({ "font-weight": 400 });
        }
    });
}

jQuery.noConflict();
(function($) {
	lgInit();
})(jQuery);