"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.embeddings = void 0;
var alibaba_tongyi_1 = require("@langchain/community/embeddings/alibaba_tongyi");
var apiKey = process.env.ALI_TONGYI_EMBEDDINGS_API_KEY || '';
exports.embeddings = new alibaba_tongyi_1.AlibabaTongyiEmbeddings({ apiKey: apiKey });
