/**
 * This file was auto-generated by Fern from our API Definition.
 */

import * as serializers from "../../..";
import * as Metriport from "../../../../api";
import * as core from "../../../../core";

export const Sample: core.serialization.ObjectSchema<serializers.devices.Sample.Raw, Metriport.devices.Sample> =
    core.serialization.object({
        time: core.serialization.string(),
        value: core.serialization.number(),
        stdDev: core.serialization.property("std_dev", core.serialization.number().optional()),
        dataSource: core.serialization.property(
            "data_source",
            core.serialization.lazyObject(async () => (await import("../../..")).devices.SourceInfo).optional()
        ),
    });

export declare namespace Sample {
    interface Raw {
        time: string;
        value: number;
        std_dev?: number | null;
        data_source?: serializers.devices.SourceInfo.Raw | null;
    }
}