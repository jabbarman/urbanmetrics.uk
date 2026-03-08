"use client";

import { useMemo } from "react";
import type { FeatureCollection, Point } from "geojson";
import type { FillLayerSpecification, LineLayerSpecification, CircleLayerSpecification, MapLayerMouseEvent } from "maplibre-gl";
import Map, { Layer, NavigationControl, Source } from "react-map-gl/maplibre";

import type { GeneratedLayer } from "@/server/datasets/types";

type MapViewProps = {
  primaryLayer: GeneratedLayer | null;
  compareLayer: GeneratedLayer | null;
  opacity: number;
  showBoundaries: boolean;
  selectedAreaId: string | null;
  onSelectArea: (areaId: string | null) => void;
};

const mapStyle = "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";

type SourceFreeFillLayer = Omit<FillLayerSpecification, "source">;
type SourceFreeLineLayer = Omit<LineLayerSpecification, "source">;
type SourceFreeCircleLayer = Omit<CircleLayerSpecification, "source">;

function fillExpression(layer: GeneratedLayer) {
  const expression: unknown[] = ["step", ["get", "value"], layer.layer.palette[0]];

  layer.layer.legendBreaks.forEach((breakPoint, index) => {
    expression.push(breakPoint, layer.layer.palette[index + 1] ?? layer.layer.palette.at(-1));
  });

  return expression;
}

function buildComparePoints(layer: GeneratedLayer): FeatureCollection<Point> {
  return {
    type: "FeatureCollection",
    features: layer.geojson.features.map((feature) => ({
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [feature.properties.centroid.lon, feature.properties.centroid.lat],
      },
      properties: feature.properties,
    })),
  };
}

export function MapView({ primaryLayer, compareLayer, opacity, showBoundaries, selectedAreaId, onSelectArea }: MapViewProps) {
  const comparePoints = useMemo(() => (compareLayer ? buildComparePoints(compareLayer) : null), [compareLayer]);

  const primaryFill = useMemo<SourceFreeFillLayer | null>(() => {
    if (!primaryLayer) {
      return null;
    }

    return {
      id: "primary-fill",
      type: "fill",
      paint: {
        "fill-color": fillExpression(primaryLayer) as never,
        "fill-opacity": opacity,
      },
    };
  }, [opacity, primaryLayer]);

  const boundaryLayer: SourceFreeLineLayer = {
    id: "ward-boundaries",
    type: "line",
    paint: {
      "line-color": "rgba(15, 23, 42, 0.25)",
      "line-width": showBoundaries ? 1 : 0,
    },
  };

  const selectedBoundary: SourceFreeLineLayer = {
    id: "selected-boundary",
    type: "line",
    filter: selectedAreaId ? ["==", ["get", "areaId"], selectedAreaId] : ["==", ["get", "areaId"], "__none__"],
    paint: {
      "line-color": "#0f172a",
      "line-width": 3,
    },
  };

  const compareCircles: SourceFreeCircleLayer | null = compareLayer
    ? {
        id: "compare-circles",
        type: "circle",
        paint: {
          "circle-color": compareLayer.layer.palette.at(-1) ?? "#0f766e",
          "circle-opacity": 0.75,
          "circle-stroke-width": 1,
          "circle-stroke-color": "rgba(255,255,255,0.9)",
          "circle-radius": [
            "interpolate",
            ["linear"],
            ["get", "value"],
            compareLayer.layer.summary.min,
            6,
            compareLayer.layer.summary.max,
            24,
          ],
        },
      }
    : null;

  const handleClick = (event: MapLayerMouseEvent) => {
    const areaId = event.features?.[0]?.properties?.areaId as string | undefined;
    onSelectArea(areaId ?? null);
  };

  return (
    <div className="overflow-hidden rounded-[2rem] border border-slate-200/80 bg-slate-950 shadow-[0_25px_80px_rgba(15,23,42,0.18)]">
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-3 text-xs uppercase tracking-[0.24em] text-slate-300">
        <span>Interactive comparison map</span>
        <span>Base geometry: WMCA wards</span>
      </div>
      <div className="h-[34rem] w-full">
        <Map
          initialViewState={{ longitude: -1.88, latitude: 52.49, zoom: 8.7 }}
          interactiveLayerIds={["primary-fill", "compare-circles"]}
          mapStyle={mapStyle}
          onClick={handleClick}
          reuseMaps
        >
          <NavigationControl position="top-right" />
          {primaryLayer && primaryFill ? (
            <Source id="primary-source" type="geojson" data={primaryLayer.geojson}>
              <Layer {...primaryFill} />
              <Layer {...boundaryLayer} />
              <Layer {...selectedBoundary} />
            </Source>
          ) : null}
          {comparePoints && compareCircles ? (
            <Source id="compare-source" type="geojson" data={comparePoints}>
              <Layer {...compareCircles} />
            </Source>
          ) : null}
        </Map>
      </div>
    </div>
  );
}
