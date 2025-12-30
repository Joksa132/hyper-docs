import { Hono } from "hono";

import { listRoutes } from "./list";
import { singleRoutes } from "./single";
import { sharingRoutes } from "./sharing";
import { starRoutes } from "./stars";
import { commentRoutes } from "./comments";

export const documentsRoute = new Hono();

documentsRoute.route("/", listRoutes);
documentsRoute.route("/", singleRoutes);
documentsRoute.route("/", sharingRoutes);
documentsRoute.route("/", starRoutes);
documentsRoute.route("/", commentRoutes);
