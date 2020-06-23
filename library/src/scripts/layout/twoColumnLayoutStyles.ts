/*
 * @author Stéphane LaFlèche <stephane.l@vanillaforums.com>
 * @copyright 2009-2019 Vanilla Forums Inc.
 * @license GPL-2.0-only
 */

import { calc, percent, px, translateY, viewHeight } from "csx";
import { media } from "typestyle";
import { styleFactory, useThemeCache, variableFactory } from "@library/styles/styleUtils";
import { globalVariables } from "@library/styles/globalStyleVars";
import { unit } from "@library/styles/styleHelpers";
import { NestedCSSProperties } from "typestyle/lib/types";
import { IThemeVariables } from "@library/theming/themeReducer";
import { IPanelLayoutClasses, layoutVariables, panelLayoutClasses } from "@library/layout/panelLayoutStyles";

export const twoColumnLayoutVariables = useThemeCache((forcedVars?: IThemeVariables) => {
    const globalVars = globalVariables(forcedVars);
    const panelLayoutVars = layoutVariables();
    const makeThemeVars = variableFactory("twoColumnLayout", forcedVars);

    const { gutter, contentWidth } = panelLayoutVars;

    // Important variables that will be used to calculate other variables
    const foundationalWidths = makeThemeVars("foundationalWidths", {
        minimalMiddleColumnWidth: 500,
        breakPoints: {
            xs: panelLayoutVars.foundationalWidths.breakPoints.xs,
        }, // Other break point are calculated
    });

    const panelInit = makeThemeVars("panel", {
        width: 343,
    });

    const panel = makeThemeVars("panel", {
        width: panelInit.width,
        paddedWidth: panelInit.width + gutter.bothSides,
    });

    const mainColumnPaddedWidth = contentWidth - panel.paddedWidth;
    const mainColumnWidth = mainColumnPaddedWidth - gutter.bothSides;

    const panelLayoutSpacing = makeThemeVars("panelLayoutSpacing", panelLayoutVars.panelLayoutSpacing);

    const panelLayoutBreakPoints = makeThemeVars("panelLayoutBreakPoints", {
        noBleed: contentWidth,
        oneColumn: foundationalWidths.minimalMiddleColumnWidth + panel.paddedWidth + globalVars.outerGutter.bothSides,
        xs: foundationalWidths.breakPoints.xs,
    });

    const mediaQueries = () => {
        const noBleed = (styles: NestedCSSProperties, useMinWidth: boolean = true) => {
            return media(
                {
                    maxWidth: px(panelLayoutBreakPoints.noBleed),
                    minWidth: useMinWidth ? px(panelLayoutBreakPoints.oneColumn + 1) : undefined,
                },
                styles,
            );
        };

        const noBleedDown = (styles: NestedCSSProperties) => {
            return media(
                {
                    maxWidth: px(panelLayoutBreakPoints.noBleed),
                },
                styles,
            );
        };

        const oneColumn = (styles: NestedCSSProperties, useMinWidth: boolean = true) => {
            return media(
                {
                    maxWidth: px(panelLayoutBreakPoints.noBleed),
                    minWidth: useMinWidth ? px(panelLayoutBreakPoints.oneColumn + 1) : undefined,
                },
                styles,
            );
        };

        const oneColumnDown = (styles: NestedCSSProperties) => {
            return media(
                {
                    maxWidth: px(panelLayoutBreakPoints.oneColumn),
                },
                styles,
            );
        };

        const aboveOneColumn = (styles: NestedCSSProperties) => {
            return media(
                {
                    minWidth: px(panelLayoutBreakPoints.oneColumn + 1),
                },
                styles,
            );
        };

        const xs = (styles: NestedCSSProperties) => {
            return media(
                {
                    maxWidth: px(panelLayoutBreakPoints.xs),
                },
                styles,
            );
        };

        return {
            noBleed,
            noBleedDown,
            oneColumn,
            oneColumnDown,
            aboveOneColumn,
            xs,
        };
    };

    return {
        foundationalWidths,
        gutter,
        panel,
        mainColumnPaddedWidth,
        mainColumnWidth,
        mediaQueries,
        panelLayoutSpacing,
        panelLayoutBreakPoints,
    };
});

export const twoColumnLayoutClasses = useThemeCache(() => {
    const vars = twoColumnLayoutVariables();
    const style = styleFactory("twoColumnLayout");
    const mediaQueries = vars.mediaQueries();

    const rightColumn = style("rightColumn", {
        position: "relative",
        width: unit(vars.panel.paddedWidth),
        flexBasis: unit(vars.panel.paddedWidth),
        minWidth: unit(vars.panel.paddedWidth),
        overflow: "initial",
    });

    const middleColumnMaxWidth = style("middleColumnMaxWidth", {
        $nest: {
            "&.hasAdjacentPanel": {
                flexBasis: calc(`100% - ${unit(vars.panel.paddedWidth)}`),
                maxWidth: calc(`100% - ${unit(vars.panel.paddedWidth)}`),
                ...mediaQueries.oneColumnDown({
                    flexBasis: percent(100),
                    maxWidth: percent(100),
                }),
            },
        },
    });

    const leftColumn = style("leftColumn", {});

    return {
        ...panelLayoutClasses(),
        rightColumn,
        leftColumn,
        middleColumnMaxWidth,
    } as IPanelLayoutClasses;
});
