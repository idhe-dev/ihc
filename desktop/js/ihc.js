$('.eqLogicAction[data-action=Thumbnail]').off().on('click', function () {
	$('.eqLogicThumbnail').show();
	$('.eqLogicThumbnailContainer').packery();
	$('.eqLogicList').hide();
});
$('.eqLogicAction[data-action=List]').off().on('click', function () {
	$('.eqLogicThumbnail').hide();
	$('.eqLogicList').show();
});
$('.eqLogicDisplayAttr[data-l1key=name]').off().on('click', function () {
	var _el = $(this);
	var id = $(this).closest('.eqLogicDisplay').attr('data-eqLogic_id');
	jeedom.eqLogic.byId({
		id: id, success: function (eqLogic) {
			bootbox.prompt({
				size: 'small',
				value: _el.closest('.eqLogicDisplay').find('.eqLogicDisplayAttr[data-l1key=name]').value(),
				title: '{{Nom de l\'équipement ?}}',
				callback: function (result) {
					if (result !== null) {
						eqLogic.name = result;
						jeedom.eqLogic.save({
							type: eqType,
							eqLogics: [eqLogic],
							error: function (error) {
								$('#div_alert').showAlert({ message: error.message, level: 'danger' });
							},
							success: function (_data) {
								_el.text(_data.name)
								$('.eqLogicDisplayCard[data-eqLogic_id=' + id + '] .name strong').text(_data.name);
								$('#table_eqLogicList').trigger('update');
							}
						});
					}
				}
			});
		}
	});
});
$('.eqLogicDisplayAttr[data-l1key=logicalId]').off().on('click', function () {
	var _el = $(this);
	var id = $(this).closest('.eqLogicDisplay').attr('data-eqLogic_id');
	jeedom.eqLogic.byId({
		id: id, success: function (eqLogic) {
			bootbox.prompt({
				size: 'small',
				value: _el.closest('.eqLogicDisplay').find('.eqLogicDisplayAttr[data-l1key=logicalId]').value(),
				title: '{{Identifiant de l\'équipement ?}}',
				callback: function (result) {
					if (result !== null) {
						eqLogic.logicalId = result;
						jeedom.eqLogic.save({
							type: eqType,
							eqLogics: [eqLogic],
							error: function (error) {
								$('#div_alert').showAlert({ message: error.message, level: 'danger' });
							},
							success: function (_data) {
								_el.text(_data.logicalId)
								$('#table_eqLogicList').trigger('update');
							}
						});
					}
				}
			});
		}
	});
});
$('.eqLogicDisplayAttr[data-l1key=object]').off().on('click', function () {
	var _el = $(this);
	var id = $(this).closest('.eqLogicDisplay').attr('data-eqLogic_id');
	jeedom.eqLogic.byId({
		id: id, success: function (eqLogic) {
			jeedom.object.all({
				success: function (objects) {
					var SelectHtml = $('<select>');
					$.each(objects, function (key, object) {
						var option = $('<option>').attr('value', object.id);
						if ($.trim(_el.text()) == $.trim(object.name))
							option.attr('selected', true);
						SelectHtml.append(option.append(object.name));
					});
					bootbox.dialog({
						title: "{{Nom de la nouvelle commande}}",
						message: SelectHtml,
						buttons: {
							"Annuler": {
								className: "btn-default",
								callback: function () {
								}
							},
							success: {
								label: "Valider",
								className: "btn-primary",
								callback: function () {
									eqLogic.object_id = $(this).find('select').val();
									var name = $(this).find('select option[value=' + eqLogic.object_id + ']').text();
									jeedom.eqLogic.save({
										type: eqType,
										eqLogics: [eqLogic],
										error: function (error) {
											$('#div_alert').showAlert({ message: error.message, level: 'danger' });
										},
										success: function (_data) {
											var object = objects[_data.object_id];
											$.each(objects, function (key, object) {
												if (object.id == _data.object_id) {
													var ObjectHtml = $('<span class="label">');
													if (object.configuration.useCustomColor) {
														ObjectHtml.css('background-color', object.display.tagColor);
														ObjectHtml.css('color', object.display.tagTextColor);
														ObjectHtml.append(object.display.icon);
														ObjectHtml.append(' ' + object.name);
													} else {
														ObjectHtml.addClass('labelObjectHuman');
														ObjectHtml.append(object.display.icon);
														ObjectHtml.append(' ' + object.name);
													}
													_el.html(ObjectHtml.prop('outerHTML'));
													$('.eqLogicDisplayCard[data-eqLogic_id=' + id + '] .name span').remove();
													ObjectHtml.insertBefore($('.eqLogicDisplayCard[data-eqLogic_id=' + id + '] .name br'));
													$('#table_eqLogicList').trigger('update');
												}
											});
										}
									});
								}
							},
						}
					});
				}
			});
		}
	});
});
$('.eqLogicDisplayAttr[data-l1key=category]').off().on('click', function () {
	var _el = $(this);
	var id = $(this).closest('.eqLogicDisplay').attr('data-eqLogic_id');
	jeedom.eqLogic.byId({
		id: id, success: function (eqLogic) {
			if (_el.attr('data-enable') == "1")
				eqLogic.category[_el.attr('data-l2key')] = false;
			else
				eqLogic.category[_el.attr('data-l2key')] = true;
			jeedom.eqLogic.save({
				type: eqType,
				eqLogics: [eqLogic],
				error: function (error) {
					$('#div_alert').showAlert({ message: error.message, level: 'danger' });
				},
				success: function (_data) {
					if (_data.category[_el.attr('data-l2key')])
						_el.removeClass('label-danger').addClass('label-success');
					else
						_el.removeClass('label-success').addClass('label-default');
					_el.attr('data-enable', _data.category[_el.attr('data-l2key')]);
					$('#table_eqLogicList').trigger('update');
				}
			});
		}
	});
});
$('.eqLogicDisplayAttr[data-l1key=isEnable]').off().on('click', function () {
	var _el = $(this);
	var id = $(this).closest('.eqLogicDisplay').attr('data-eqLogic_id');
	jeedom.eqLogic.byId({
		id: id, success: function (eqLogic) {
			if (_el.attr('data-enable') == "1")
				eqLogic.isEnable = false;
			else
				eqLogic.isEnable = true;
			jeedom.eqLogic.save({
				type: eqType,
				eqLogics: [eqLogic],
				error: function (error) {
					$('#div_alert').showAlert({ message: error.message, level: 'danger' });
				},
				success: function (_data) {
					if (_data.isEnable) {
						_el.removeClass('label-danger').addClass('label-success').text("{{Oui}}");
						$('.eqLogicDisplayCard[data-eqLogic_id=' + id + ']').removeClass('disableCard');
					} else {
						_el.removeClass('label-success').addClass('label-danger').text("{{Non}}");
						$('.eqLogicDisplayCard[data-eqLogic_id=' + id + ']').addClass('disableCard');
					}
					_el.attr('data-enable', _data.isEnable);
					$('#table_eqLogicList').trigger('update');
				}
			});
		}
	});
});
$('.eqLogicDisplayAttr[data-l1key=isVisible]').off().on('click', function () {
	var _el = $(this);
	var id = $(this).closest('.eqLogicDisplay').attr('data-eqLogic_id');
	jeedom.eqLogic.byId({
		id: id, success: function (eqLogic) {
			if (_el.attr('data-enable') == "1")
				eqLogic.isVisible = false;
			else
				eqLogic.isVisible = true;
			jeedom.eqLogic.save({
				type: eqType,
				eqLogics: [eqLogic],
				error: function (error) {
					$('#div_alert').showAlert({ message: error.message, level: 'danger' });
				},
				success: function (_data) {
					if (_data.isVisible)
						_el.removeClass('label-danger').addClass('label-success').text("{{Oui}}");
					else
						_el.removeClass('label-success').addClass('label-danger').text("{{Non}}");
					_el.attr('data-enable', _data.isVisible);
					$('#table_eqLogicList').trigger('update');
				}
			});
		}
	});
});


$("#table_cmd").sortable({ axis: "y", cursor: "move", items: ".cmd", placeholder: "ui-state-highlight", tolerance: "intersect", forcePlaceholderSize: true });
function DptUnit(Dpt) {
	var result;
	$.each(AllDpt, function (DptKeyGroup, DptValueGroup) {
		$.each(DptValueGroup, function (DptKey, DptValue) {
			if (DptKey == Dpt)
				result = DptValue.Unite;
		});
	});
	return result;
}
function DptMin(Dpt) {
	var result;
	$.each(AllDpt, function (DptKeyGroup, DptValueGroup) {
		$.each(DptValueGroup, function (DptKey, DptValue) {
			if (DptKey == Dpt)
				result = DptValue.min;
		});
	});
	return result;
}
function DptMax(Dpt) {
	var result;
	$.each(AllDpt, function (DptKeyGroup, DptValueGroup) {
		$.each(DptValueGroup, function (DptKey, DptValue) {
			if (DptKey == Dpt)
				result = DptValue.max;
		});
	});
	return result;
}
function getDptSousType(Dpt, type) {
	var result;
	$.each(AllDpt, function (DptKeyGroup, DptValueGroup) {
		$.each(DptValueGroup, function (DptKey, DptValue) {
			if (DptKey == Dpt) {
				if (type == 'info')
					result = DptValue.InfoType;
				else
					result = DptValue.ActionType;
			}
		});
	});
	return result;
}
function DptOption(Dpt, div) {
	$.each(AllDpt, function (DptKeyGroup, DptValueGroup) {
		$.each(DptValueGroup, function (DptKey, DptValue) {
			if (DptKey == Dpt) {
				$.each(DptValue.Option, function (Optionkey, Optionvalue) {
					if (DptKey == Dpt && div.find('.cmdAttr[data-l2key=option][data-l3key=' + Optionvalue + ']').length <= 0) {
						div.append($('<label>')
							.text(Optionvalue)
							.append($('<sup>')
								.append($('<i class="fas fa-question-circle tooltips">')
									.attr('title', Optionvalue))));
						div.append($('<div class="input-group">')
							.append($('<input class="cmdAttr form-control input-sm roundedLeft" data-l1key="configuration" data-l2key="option" data-l3key="' + Optionvalue + '">'))
							.append($('<span class="input-group-btnroundedRight ">')
								.append($('<a class="btn btn-success btn-sm bt_selectCmdExpression" data-type="">')
									.append($('<i class="fas fa-list-alt">')))));
					}
				});
			}
		});
	});
}
function DptListSelect(Dpt) {
	var DptListSelect = '';
	$.each(AllDpt, function (DptKeyGroup, DptValueGroup) {
		$.each(DptValueGroup, function (DptKey, DptValue) {
			if (DptKey == Dpt) {
				$.each(DptValue.Valeurs, function (keyValeurs, Valeurs) {
					if (DptListSelect != "")
						DptListSelect += ";";
					//DptListSelect += keyValeurs + "|" + Valeurs;
					DptListSelect += Valeurs + "|" + Valeurs;
				});
			}
		});
	});
	return DptListSelect;
}
function DptValue(Dpt, _el) {
	$.each(AllDpt, function (DptKeyGroup, DptValueGroup) {
		$.each(DptValueGroup, function (DptKey, DptValue) {
			if (DptKey == Dpt) {
				if (DptValue.Valeurs.length > 0) {
					var Valeur = _el.val();
					var DptValues = $('<select class="cmdAttr form-control input-sm" data-l1key="configuration" data-l2key="IhcObjectValue">');
					DptValues.append($('<option>').attr('value', '').text('{{Imposer une valeur}}'));
					$.each(DptValue.Valeurs, function (keyValeurs, Valeurs) {
						DptValues.append($('<option>').attr('value', keyValeurs).text(Valeurs));
					});
					_el.parent().html(DptValues);
					_el.find('option[value="' + Valeur + '"]').prop('selected', true);

				}
			}
		});
	});
}
function OptionSelectDpt() {
	var DptSelectorOption = $('<div>');
	DptSelectorOption.append($('<option>').attr('value', '').text('{{Sélectionnez un Type de Commande}}'));
	$.each(AllDpt, function (DptKeyGroup, DptValueGroup) {
		var DptOptionGroup = $('<optgroup>').attr('label', DptKeyGroup);
		$.each(DptValueGroup, function (DptKey, DptValue) {
			DptOptionGroup.append($('<option>').attr('value', DptKey).text(DptKey + ' - ' + DptValue["Name"]));
		});
		DptSelectorOption.append(DptOptionGroup);
	});
	return DptSelectorOption.children();
}
function addCmdToTable(_cmd) {
	if (!isset(_cmd)) {
		var _cmd = { configuration: {} };
	}
	var tr = $('<tr class="cmd" data-cmd_id="' + init(_cmd.id) + '">');
	tr.append($('<td>')
		.append($('<i class="fas fa-minus-circle pull-right cmdAction cursor" data-action="remove">'))
		.append($('<i class="fas fa-arrows-alt-v pull-left cursor bt_sortable">')));
	tr.append($('<td>')
		.append($('<input type="hidden" class="cmdAttr form-control input-sm" data-l1key="id">'))
		.append($('<input class="cmdAttr form-control input-sm" data-l1key="name" value="' + init(_cmd.name) + '" placeholder="{{Name}}" title="Name">')));
	tr.append($('<td>')
		.append($('<div class="form-group">')
			.append($('<label>')
				.text('{{Type de Commande}}')
				.append($('<sup>')
					.append($('<i class="fas fa-question-circle tooltips">')
						.attr('title', 'Selectionnez le type de commande IHC'))))
			.append($('<select class="cmdAttr form-control input-sm" data-l1key="configuration" data-l2key="IhcObjectType">')
				.append(OptionSelectDpt())))
		.append($('<div class="form-group">')
			.append($('<label>')
				.text('{{Resource ID}}')
				.append($('<sup>')
					.append($('<i class="fas fa-question-circle tooltips">')
						.attr('title', 'Saisisez le Resource ID de votre commande IHC'))))
			.append($('<div class="input-group">')
				.append($('<input class="cmdAttr form-control input-sm roundedLeft" data-l1key="logicalId" placeholder="{{Resource ID}}" title="{{Resource ID}}">'))
				)));

	tr.append($('<td>')
		.append($('<div>')
			.append($('<span>')
				.append($('<label class="checkbox-inline">')
					.append($('<input type="checkbox" class="cmdAttr checkbox-inline" data-size="mini" data-label-text="{{Inverser}}" data-l1key="configuration" data-l2key="inverse"/>'))
					.append('{{Inverser}}')
					.append($('<sup>')
						.append($('<i class="fas fa-question-circle tooltips">')
							.attr('title', 'Inversez l\'état de la valeur'))))))
		.append($('<div class="RetourEtat">')
			.append($('<label>')
				.text('{{Retour d\'état}}')
				.append($('<sup>')
					.append($('<i class="fas fa-question-circle tooltips">')
						.attr('title', 'Choisissez un objet jeedom contenant la valeur de votre commande'))))
			.append($('<div class="input-group">')
				.append($('<input class="cmdAttr form-control input-sm roundedLeft" data-l1key="value">'))
				.append($('<span class="input-group-btn roundedRight">')
					.append($('<a class="btn btn-success btn-sm bt_selectCmdExpression" data-type="info" id="value">')
						.append($('<i class="fas fa-list-alt">'))))))
		.append($('<div class="option">'))
		.append($('<div class="ValeurMinMax">')
			.append($('<label>')
				.text('{{Valeur Min et Max}}')
				.append($('<sup>')
					.append($('<i class="fas fa-question-circle tooltips">')
						.attr('title', 'Saisisez dans ses champs la valeur minimum et maximum de votre controle'))))
			.append($('<div class="input-group">')
				.append($('<input class="cmdAttr form-control input-sm" data-l1key="configuration" data-l2key="minValue" placeholder="{{Min}}" title="{{Min}}" >')))
			.append($('<div class="input-group">')
				.append($('<input class="cmdAttr form-control input-sm" data-l1key="configuration" data-l2key="maxValue" placeholder="{{Max}}" title="{{Max}}" >'))))
		.append($('<div class="ValeurUnite">')
			.append($('<label>')
				.text('{{Unitée de cette commande}}')
				.append($('<sup>')
					.append($('<i class="fas fa-question-circle tooltips">')
						.attr('title', 'Saisisez l\'unitée de cette commande'))))
			.append($('<div class="input-group">')
				.append($('<input class="cmdAttr form-control input-sm" data-l1key="unite" placeholder="{{Unitée}}" title="Unitée">'))))
		.append($('<div class="listValue">')
			.append($('<label>')
				.text('{{Valeur de la liste}}')
				.append($('<sup>')
					.append($('<i class="fas fa-question-circle tooltips">')
						.attr('title', 'Saisisez les differentes valeurs de cette liste'))))
			.append($('<div class="input-group">')
				.append($('<input class="cmdAttr form-control input-sm" data-l1key="configuration" data-l2key="listValue" placeholder="{{Saisisez les differentes valeurs de cette liste séparer par |}}" title="Valeur de liste">'))))
		.append($('<div class="ValeurDefaut">')
			.append($('<label>')
				.text('{{Valeur figée de cette commande}}')
				.append($('<sup>')
					.append($('<i class="fas fa-question-circle tooltips">')
						.attr('title', 'Choisissez, si vous le souhaitez la valeur fixe de votre commande'))))
			.append($('<div class="input-group">')
				.append($('<input class="cmdAttr form-control input-sm" data-l1key="configuration" data-l2key="IhcObjectValue" placeholder="{{Valeur par défaut}}" title="{{Valeur par défaut}}">')))));
	tr.append($('<td>')
		.append($('<span class="type" type="' + init(_cmd.type) + '">')
			.append(jeedom.cmd.availableType()))
		.append($('<span>')
			.append($('<label class="checkbox-inline">')
				.append($('<input type="checkbox" class="cmdAttr checkbox-inline" data-size="mini" data-label-text="{{Sous type automatique}}"  data-l1key="configuration"  data-l2key="subTypeAuto" checked/>'))
				.append('{{Sous type automatique}}')
				.append($('<sup>')
					.append($('<i class="fas fa-question-circle tooltips">')
						.attr('title', 'Laisser Jeedom choisir le sous type')))))
		.append($('<span class="subType" subType="' + init(_cmd.subType) + '">')));
	var parmetre = $('<td>');
	if (is_numeric(_cmd.id)) {
		parmetre.append($('<a class="btn btn-default btn-xs cmdAction" data-action="test">')
			.append($('<i class="fas fa-rss">')
				.text(' {{Tester}}')));
	}
	parmetre.append($('<a class="btn btn-default btn-xs cmdAction tooltips" data-action="configure">')
		.append($('<i class="fas fa-cogs">')));
	parmetre.append($('<a class="btn btn-default btn-xs cmdAction tooltips" data-action="copy" title="{{Dupliquer}}">')
		.append($('<i class="fas fa-copy">')));
	parmetre.append($('<a class="btn btn-default btn-xs cmdAction tooltips bt_read">')
		.append($('<i class="fas fa-rss">')
			.text(' {{Read}}')));
	parmetre.append($('<div>')
		.append($('<span>')
			.append($('<label class="checkbox-inline">')
				.append($('<input type="checkbox" class="cmdAttr checkbox-inline" data-size="mini" data-label-text="{{Historiser}}" data-l1key="isHistorized" checked/>'))
				.append('{{Historiser}}')
				.append($('<sup>')
					.append($('<i class="fas fa-question-circle tooltips">')
						.attr('title', 'Souhaitez vous Historiser les changements de valeur'))))));
	parmetre.append($('<div>')
		.append($('<span>')
			.append($('<label class="checkbox-inline">')
				.append($('<input type="checkbox" class="cmdAttr checkbox-inline" data-size="mini" data-label-text="{{Afficher}}" data-l1key="isVisible" checked/>'))
				.append('{{Afficher}}')
				.append($('<sup>')
					.append($('<i class="fas fa-question-circle tooltips">')
						.attr('title', 'Souhaitez vous afficher cette commande sur le dashboard'))))));
	tr.append(parmetre);
	$('#table_cmd tbody').append(tr);
	DptValue(_cmd.configuration.IhcObjectType, $('#table_cmd tbody tr:last').find('.cmdAttr[data-l2key=IhcObjectValue]'));
	DptOption(_cmd.configuration.IhcObjectType, $('#table_cmd tbody tr:last').find('.option'));
	$('.bt_selectCmdExpression').off().on('click', function () {
		var el = $(this).closest('.input-group').find('.cmdAttr');
		var type = $(this).attr('data-type');
		$(this).value()
		jeedom.cmd.getSelectModal({ cmd: { type: type }, eqLogic: { eqType_name: '' } }, function (result) {
			var value = el.val();
			if (value != '')
				value = value + '|';
			value = value + result.human;
			el.val(value);
		});
	});
	$('.bt_read').off().on('click', function () {
		$.ajax({
			type: 'POST',
			async: false,
			url: 'plugins/ihc/core/ajax/ihc.ajax.php',
			data:
			{
				action: 'Read',
				Gad: $(this).closest('.cmd').find('.cmdAttr[data-l1key=logicalId]').val(),
			},
			dataType: 'json',
			global: false,
			error: function (request, status, error) { },
			success: function (data) {
				if (data.result === false)
					$('#div_alert').showAlert({ message: 'Aucun message recu', level: 'error' });
				else
					$('#div_alert').showAlert({ message: 'Message recu :' + data.result, level: 'success' });
			}
		});
	});
	/*$('.cmdAttr[data-l1key=logicalId]').off().on('keyup', function() {
		var valeur= $(this).val();
		var Gad=valeur.split('/');
		if(Gad.length < parseInt(GadLevel)){
			if($.isNumeric(Gad[Gad.length - 1])){
				if(Gad[Gad.length - 1]==0 || Gad[Gad.length - 1]+100>254)
					valeur+='/';
			}
		}
		if(valeur.substr(-2) =='//')
			valeur.substring(0,-1);
		if(valeur.substr(-1) =='//' && Gad.length == parseInt(data.result))
			valeur.substring(0,-1);
		$(this).val(valeur);
	}); */
	$('#table_cmd tbody tr:last').setValues(_cmd, '.cmdAttr');
	jeedom.cmd.changeType($('#table_cmd tbody tr:last'), init(_cmd.subType));
}
$('body').off('change', '.cmdAttr[data-l1key=configuration][data-l2key=IhcObjectType]').on('change', '.cmdAttr[data-l1key=configuration][data-l2key=IhcObjectType]', function () {
	DptOption($(this).val(), $(this).closest('.cmd').find('.option'));
	if ($(this).closest('.cmd').find('.cmdAttr[data-l1key=unite]').val() == '')
		$(this).closest('.cmd').find('.cmdAttr[data-l1key=unite]').val(DptUnit($(this).val()));
	DptValue($(this).val(), $(this).closest('.cmd').find('.cmdAttr[data-l2key=IhcObjectValue]'));
	$(this).closest('.cmd').find('.cmdAttr[data-l1key=subType]').trigger('change');
});
$('body').off('change', '.cmdAttr[data-l1key=type]').on('change', '.cmdAttr[data-l1key=type]', function () {
	switch ($(this).val()) {
		case "info":
			$(this).closest('.cmd').find('.RetourEtat').hide();
			$(this).closest('.cmd').find('.bt_read').show();
			$(this).closest('.cmd').find('.cmdAttr[data-l1key=configuration][data-l2key=IhcObjectValue]').hide();
			$(this).closest('.cmd').find('.cmdAttr[data-l1key=isHistorized]').closest('.input-group').parent().show();
			break;
		case "action":
			$(this).closest('.cmd').find('.RetourEtat').show();
			$(this).closest('.cmd').find('.bt_read').hide();
			$(this).closest('.cmd').find('.cmdAttr[data-l1key=configuration][data-l2key=IhcObjectValue]').show();
			$(this).closest('.cmd').find('.cmdAttr[data-l1key=isHistorized]').closest('.input-group').parent().hide();
			break;
	}
	setTimeout(function () {
		$(this).closest('.cmd').find('.cmdAttr[data-l1key=subType]').trigger('change');
	}.bind(this), 500);
});
$('body').off('change', '.cmdAttr[data-l1key=subType]').on('change', '.cmdAttr[data-l1key=subType]', function () {
	var Dpt = $(this).closest('.cmd').find('.cmdAttr[data-l1key=configuration][data-l2key=IhcObjectType]').val();
	var type = $(this).closest('.cmd').find('.cmdAttr[data-l1key=type]').val();
	var value = $(this).val();
	if ($(this).closest('.cmd').find('.cmdAttr[data-l1key=configuration][data-l2key=subTypeAuto]').is(':checked')) {
		value = getDptSousType(Dpt, type);
		$(this).closest('.cmd').find('.cmdAttr[data-l1key=subType] option[value="' + value + '"]').prop('selected', true);
		$(this).closest('.cmd').find('.cmdAttr[data-l1key=configuration][data-l2key=subTypeAuto]').trigger('change');
	}
	switch (value) {
		case "slider":
			$(this).closest('.cmd').find('.ValeurMinMax').show();
			$(this).closest('.cmd').find('.ValeurUnite').hide();
			$(this).closest('.cmd').find('.ValeurDefaut').hide();
			$(this).closest('.cmd').find('.listValue').hide();
			$(this).closest('.cmd').find('.cmdAttr[data-l1key=configuration][data-l2key=inverse]')
				.closest('.input-group').parent().show();
			if ($(this).closest('.cmd').find('.cmdAttr[data-l1key=configuration][data-l2key=minValue]').val() == "")
				$(this).closest('.cmd').find('.cmdAttr[data-l1key=configuration][data-l2key=minValue]').val(DptMin(Dpt));
			if ($(this).closest('.cmd').find('.cmdAttr[data-l1key=configuration][data-l2key=maxValue]').val() == "")
				$(this).closest('.cmd').find('.cmdAttr[data-l1key=configuration][data-l2key=maxValue]').val(DptMax(Dpt));
			break;
		case "numeric":
			$(this).closest('.cmd').find('.ValeurMinMax').show();
			$(this).closest('.cmd').find('.ValeurUnite').show();
			$(this).closest('.cmd').find('.ValeurDefaut').hide();
			$(this).closest('.cmd').find('.listValue').hide();
			$(this).closest('.cmd').find('.cmdAttr[data-l1key=configuration][data-l2key=inverse]')
				.closest('.input-group').parent().show();
			if ($(this).closest('.cmd').find('.cmdAttr[data-l1key=configuration][data-l2key=minValue]').val() == "")
				$(this).closest('.cmd').find('.cmdAttr[data-l1key=configuration][data-l2key=minValue]').val(DptMin(Dpt));
			if ($(this).closest('.cmd').find('.cmdAttr[data-l1key=configuration][data-l2key=maxValue]').val() == "")
				$(this).closest('.cmd').find('.cmdAttr[data-l1key=configuration][data-l2key=maxValue]').val(DptMax(Dpt));
			break;
		case "other":
			$(this).closest('.cmd').find('.ValeurDefaut').show();
			$(this).closest('.cmd').find('.ValeurMinMax').hide();
			$(this).closest('.cmd').find('.ValeurUnite').hide();
			$(this).closest('.cmd').find('.listValue').hide();
			$(this).closest('.cmd').find('.cmdAttr[data-l1key=configuration][data-l2key=inverse]')
				.closest('.input-group').parent().hide();
			break;
		case "binary":
			$(this).closest('.cmd').find('.ValeurMinMax').hide();
			$(this).closest('.cmd').find('.ValeurUnite').hide();
			$(this).closest('.cmd').find('.ValeurDefaut').hide();
			$(this).closest('.cmd').find('.listValue').hide();
			$(this).closest('.cmd').find('.cmdAttr[data-l1key=configuration][data-l2key=inverse]')
				.closest('.input-group').parent().show();
			break;
		case "select":
			$(this).closest('.cmd').find('.ValeurMinMax').hide();
			$(this).closest('.cmd').find('.ValeurUnite').hide();
			$(this).closest('.cmd').find('.ValeurDefaut').hide();
			$(this).closest('.cmd').find('.listValue').show();
			if ($(this).closest('.cmd').find('.cmdAttr[data-l1key=configuration][data-l2key=listValue]').val() == "")
				$(this).closest('.cmd').find('.cmdAttr[data-l1key=configuration][data-l2key=listValue]').val(DptListSelect(Dpt));
			$(this).closest('.cmd').find('.cmdAttr[data-l1key=configuration][data-l2key=inverse]')
				.closest('.input-group').parent().hide();
			break;
		default:
			$(this).closest('.cmd').find('.ValeurDefaut').hide();
			$(this).closest('.cmd').find('.ValeurMinMax').hide();
			$(this).closest('.cmd').find('.ValeurUnite').hide();
			$(this).closest('.cmd').find('.listValue').hide();
			$(this).closest('.cmd').find('.cmdAttr[data-l1key=configuration][data-l2key=inverse]')
				.closest('.input-group').parent().hide();
			break;
	}
});
$('body').off('change', '.cmdAttr[data-l1key=configuration][data-l2key=subTypeAuto]').on('change', '.cmdAttr[data-l1key=configuration][data-l2key=subTypeAuto]', function () {
	if ($(this).is(':checked')) {
		$(this).closest('.cmd').find('.cmdAttr[data-l1key=subType]').attr('disabled', true);
	} else
		$(this).closest('.cmd').find('.cmdAttr[data-l1key=subType]').attr('disabled', false);
});
