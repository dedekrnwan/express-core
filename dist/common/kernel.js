"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const middlewares_1 = __importDefault(require("./middlewares"));
const decorators_1 = require("./../decorators");
const utils_1 = require("../utils");
class Kernel {
    constructor() {
        this.response = (structured, request, response, next) => {
            response.status((structured.code) ? Number.isInteger(structured.code) ? structured.code < 600 ? structured.code : 500 : 500 : 500).json(structured);
        };
        this.notFound = (request, response, next) => {
            response.status(404).json({
                code: 404,
                message: 'Not found',
            });
        };
        this.use = (core, app) => new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                core.disabled('x-powered-by');
                core.disabled('etag');
                //loop middlewares
                this.core = yield this.Middlewares.before(core, app.middlewares.before || []);
                yield utils_1.asyncForEach(app.modules, (handler) => __awaiter(this, void 0, void 0, function* () {
                    this.core = yield decorators_1.AttachController(this.core, handler.path, handler.prefix);
                }));
                this.core = yield this.Middlewares.after(this.core, app.middlewares.after || []);
                this.core.use(this.response);
                this.core.use(this.notFound);
                this.core = yield this.Middlewares.error(this.core, app.middlewares.error || []);
                resolve(this.core);
            }
            catch (error) {
                reject(error);
            }
        }));
        this.Middlewares = new middlewares_1.default;
    }
}
exports.default = Kernel;
