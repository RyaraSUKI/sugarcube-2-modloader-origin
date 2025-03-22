/***********************************************************************************************************************

	locale/fr-FR.js – Français

	Localization by: manonamora, based on the outdated localization by Marc Cornette, Pierre Kessler.

	Copyright © 2019–2024 Thomas Michael Edwards <thomasmedwards@gmail.com>. All rights reserved.
	Use of this source code is governed by a BSD 2-clause "Simplified" License, which may be found in the LICENSE file.

	For more information about the guidelines used to create this localization, see:
		http://www.motoslave.net/sugarcube/2/docs/#guide-localization

***********************************************************************************************************************/
/* global l10nStrings */
/* eslint-disable strict */

(() => {
	/*******************************************************************************
		General.
	*******************************************************************************/

	l10nStrings.textAbort = 'Abandonner';

	l10nStrings.textAborting = 'Abandon';

	l10nStrings.textCancel = 'Annuler';

	l10nStrings.textClear = 'Effacer';

	l10nStrings.textClose = 'Fermer';

	l10nStrings.textDelete = 'Effacer';
	/* NOTE: Delete and Clear are essentially the same word in French.
 		'Supprimer' can be a synonym for Delete, if needed. */

	l10nStrings.textExport = 'Exporter';

	// In lowercase, if possible.
	l10nStrings.textIdentity = 'jeu';

	l10nStrings.textImport = 'Importer';

	l10nStrings.textLoad = 'Charger';

	l10nStrings.textOff = 'Off';

	l10nStrings.textOk = 'OK';

	l10nStrings.textOn = 'On';

	l10nStrings.textSave = 'Sauvegarder';

	// (noun) chance to act (in a game), moment, period
	l10nStrings.textTurn = 'Tour';


	/*******************************************************************************
		Errors.
	*******************************************************************************/

	// NOTE: `passage` is supplied locally.
	l10nStrings.errorNonexistentPassage = 'le passage "{passage}" n\'éxiste pas';


	/*******************************************************************************
		Warnings.
	*******************************************************************************/

	l10nStrings.warningNoStorage = 'Toutes les API de stockage utilisables sont manquantes. Les causes possibles peuvent être soit un paramètre de cookie tiers désactivé, ce qui affecte également la sauvegarde Web, ou un mode de navigation privée.';

	l10nStrings.warningNoWebStorage = 'Vu que l\'API Web Storage est manquante, ce {textIdentity} s’exécutera en mode dégradé. Vous pouvez continuer, mais il est possible que certains éléments ne fonctionnent pas correctement.';

	l10nStrings.warningDegraded = 'Certaines fonctionnalités requises pour supporter ce {textIdentity} sont manquantes, il est donc exécuté dans un mode dégradé.';

	l10nStrings.warningNoSaves = 'Certaines fonctionnalités requises pour supporter les sauvegardes sont manquantes. Les sauvegardes seront donc désactivées pour cette session.';


	/*******************************************************************************
		API: Save.
	*******************************************************************************/

	l10nStrings.saveErrorDisallowed = 'Les sauvegardes sont désactivées pour ce passage.';

	l10nStrings.saveErrorDecodeFail = 'impossible de décoder la sauvegarde, provablement en raison d\'une corruption';

	l10nStrings.saveErrorDiskLoadFail = 'échec du chargement du fichier de sauvegarde provenant du disque';

	l10nStrings.saveErrorIdMismatch = 'la sauvegarde ne provient pas de ce {textIdentity}';

	l10nStrings.saveErrorInvalidData = 'les données requises sont manquantes dans cette suvegarde, probablement en raison d\'une corruption';

	l10nStrings.saveErrorNonexistent = 'la sauvegarde n\'existe pas';


	/*******************************************************************************
		Base UI.
	*******************************************************************************/

	l10nStrings.uiBarLabelToggle = 'Afficher/cacher la barre d\'interface';
	/* Note: Could also be 'la barre UI' instead of 'la barre d\'interface' */

	l10nStrings.uiBarLabelBackward = 'Revenir en arrière dans l\'histoire du {textIdentity}';

	l10nStrings.uiBarLabelForward = 'Progresser dans l\'histoire du {textIdentity}';

	// [DEPRECATED]
	l10nStrings.uiBarLabelJumpto = 'Retourner à un point précis de l\'histoire du {textIdentity}';


	/*******************************************************************************
		Dialog: Alert.
	*******************************************************************************/

	l10nStrings.alertTitle = 'Alerte';


	/*******************************************************************************
		Dialog: Restart.
	*******************************************************************************/

	l10nStrings.restartTitle = 'Recommencer';

	l10nStrings.restartMesgPrompt = 'Êtes vous sûr(e) de vouloir recommencer ? Tous progrès non sauvegardés seront perdus.';


	/*******************************************************************************
		Dialog: Saves.
	*******************************************************************************/

	l10nStrings.continueTitle = 'Continuer';

	l10nStrings.savesTitle = 'Sauvegardes';

	l10nStrings.savesHeaderBrowser = 'Dans le Navigateur';

	l10nStrings.savesHeaderDisk = 'Sur le Disque';

	l10nStrings.savesLabelBrowserClear = 'Effacter toute les sauvegardes du navigateur';

	l10nStrings.savesLabelBrowserExport = 'Exporter les sauvegardes du navigateur en un fichier groupé';

	l10nStrings.savesLabelBrowserImport = 'Importer des sauvegardes depuis un fichier groupé';

	l10nStrings.savesLabelDiskLoad = 'Charger depuis le disque';

	l10nStrings.savesLabelDiskSave = 'Enregistrer sur le disque';

	l10nStrings.savesTextBrowserAuto = 'Sauvegarde Auto';
	/* Note: The more correct version is technically 'Sauvegarde Automatique' */

	l10nStrings.savesTextBrowserSlot = 'Emplacement';

	l10nStrings.savesTextNoDate = 'date inconnue';
	/* Note: or  'date intéterminée' */

	/*******************************************************************************
		Dialog: Settings.
	*******************************************************************************/

	l10nStrings.settingsTitle = 'Paramètres';

	l10nStrings.settingsTextReset = 'Réinitialiser';


	/*******************************************************************************
		Debugging: Error Views.
	*******************************************************************************/

	l10nStrings.errorViewTitle = 'Erreur';

	l10nStrings.errorViewLabelToggle = 'Afficher/Cacher l\'erreur';


	/*******************************************************************************
		Debugging: Debug bar.
	*******************************************************************************/

	l10nStrings.debugBarLabelToggle = 'Afficher/Cacher la barre de débuggage';

	l10nStrings.debugBarLabelViewsToggle = 'Afficher/Cacher le mode débuggage';

	l10nStrings.debugBarLabelWatchAdd = 'Ajouter une surveillance';

	l10nStrings.debugBarLabelWatchAll = 'Tout surveiller';

	l10nStrings.debugBarLabelWatchClear = 'Ne rien surveiller';

	l10nStrings.debugBarLabelWatchDelete = 'Supprimer cette surveillance';

	l10nStrings.debugBarLabelWatchPlaceholder = 'nom de la variable';

	l10nStrings.debugBarLabelPassagePlaceholder = 'nom du passage';

	l10nStrings.debugBarLabelPassagePlay = 'Jouer passage';

	l10nStrings.debugBarLabelWatchToggle = 'Afficher/Cacher le panneau de surveillance';

	l10nStrings.debugBarMesgNoWatches = 'Pas de surveillance active';

	l10nStrings.debugBarTextAdd = 'Ajouter';

	l10nStrings.debugBarTextPassage = 'Passage';

	l10nStrings.debugBarTextViews = 'Vues';

	l10nStrings.debugBarTextWatch = 'Surveiller';
	/* Note: if you mean watch as in the noun: 'Surveillance' */


	/*******************************************************************************
		Macros.
	*******************************************************************************/

	// (verb) rewind, revert
	l10nStrings.macroBackText = 'En arrière';

	// (verb) go/send back
	l10nStrings.macroReturnText = 'Retour';


	/*******************************************************************************
		[DEPRECATED] Dialog: Autoload.
	*******************************************************************************/

	l10nStrings.autoloadTitle = 'Chargement Automatique';
	/* Note: 'Auto-charchement' is also correct */

	l10nStrings.autoloadMesgPrompt = 'Une sauvegarde automatique est disponible. Voulez-vous la charger ou retourner au début ?';

	l10nStrings.autoloadTextCancel = 'Aller au début';

	l10nStrings.autoloadTextOk = 'Charger la sauvegarde automatique';

	/*******************************************************************************
		[DEPRECATED] Dialog: Jump To.
	*******************************************************************************/

	l10nStrings.jumptoTitle = 'Aller à';

	l10nStrings.jumptoMesgUnavailable = 'Aucun point de retour actuellement disponible\u2026';


	/*******************************************************************************
		[DEPRECATED] Dialog: Share.
	*******************************************************************************/

	l10nStrings.shareTitle = 'Partager';
})();
