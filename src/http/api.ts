import { sendGet, sendPost } from "./request";
import { handleFetchEventSource } from "../util/request";
import { FetchSSE } from "../util/fetchSSE"
import { useMessageStore } from "../store/modules/message";
import { List } from "echarts";
// export function requestFileList(): Promise<any> {
//   return new Promise((resolve, reject) => {
//     const url = "/api/follow-up/listFile";
//     sendGet(
//       url,
//       {},
//       (res: { data: any }) => {
//         resolve(res.data.data);
//       },
//       (err: any) => {
//         reject(err);
//       }
//     );
//   });
// }
export function requestFileList(params: any): Promise<any> {
  if (params.length == 0) {
    params = [0, 1, 2];
  }
  return new Promise((resolve, reject) => {
    const url = "/api/follow-up/listFile";
    sendPost(
      url,
      params,
      {},
      (res: { data: any }) => {
        resolve(res.data.data);
      },
      (err: any) => {
        reject(err);
      }
    );
  });
}

export function requestFileListAw1(): Promise<any> {
  return new Promise((resolve, reject) => {
    const url = "/api/aw/evaluation/listFile";
    sendGet(
      url,
      {},
      (res: { data: any }) => {
        resolve(res.data.data);
      },
      (err: any) => {
        reject(err);
      }
    );
  });
}

export function requestFileListAw(): Promise<any> {
  return new Promise((resolve, reject) => {
    const url = "/aw/llm-aw/list";
    sendGet(
      url,
      {},
      (res: { data: any }) => {
        resolve(res.data.data);
      },
      (err: any) => {
        reject(err);
      }
    );
  });
}

// 获取表单数据
export function requestFormData(): Promise<any> {
  return new Promise((resolve, reject) => {
    const messageStore = useMessageStore();
    sendGet(
      `/api/follow-up/singleData/${messageStore.selectedFile}`,
      {},
      (res: { data: any }) => {
        resolve(res.data.data);
      },
      (err: any) => {
        console.log(err);
      }
    );
  });
}
// 获取单次表单数据-奥维
export function requestAWFormData(message: string): Promise<any> {
  let params = {
    message,
  };
  return new Promise((resolve, reject) => {
    sendPost(
      `/api/aw/evaluation/singleData`,
      params,
      {},
      (res: { data: any }) => {
        resolve(res.data.data);
      },
      (err: any) => {
        console.log(err);
      }
    );
  });
}

export function requestAudio2Text(fileId: string, onmessage: Function) {
  const url_qaStream = "/api/follow-up/audio";
  let params_qa = {
    id: fileId,
  };
  handleFetchEventSource(url_qaStream, params_qa, onmessage);
}
//对话
export function getLLMChat(params: object, onmessage: Function) {
  const url_qaStream = "/api/follow-up/sendMessage";
  let params_qa = params;
  handleFetchEventSource(url_qaStream, params_qa, onmessage);
}

//aw对话
export function getLLMChatAw(params: object, onmessage: Function) {
  const url_qaStream = "/api/aw/evaluation/sendMessage";
  let params_qa = params;
  handleFetchEventSource(url_qaStream, params_qa, onmessage);
}

// 根据产品档次，获取型号
export function selectByProductGrade(
  fileId: string,
  productGrade: string
): Promise<any> {
  let params = {
    fileId: fileId,
    productGrade: productGrade,
  };
  return new Promise((resolve, reject) => {
    const url = "/api/follow-up/selectByProductGrade";
    sendPost(
      url,
      params,
      {},
      (res: { data: any }) => {
        resolve(res.data.data);
      },
      (err: any) => {
        reject(err);
      }
    );
  });
}

// 获取柱形图数据
export function nps(fileId: string, type: string): Promise<any> {
  let params = {
    fileId: fileId,
    type: type,
  };
  return new Promise((resolve, reject) => {
    const url = "/api/follow-up/nps";
    sendPost(
      url,
      params,
      {},
      (res: { data: any }) => {
        resolve(res.data.data);
      },
      (err: any) => {
        reject(err);
      }
    );
  });
}

// 获取饼状图数据
export function customerAttitudeType(params: object): Promise<any> {
  return new Promise((resolve, reject) => {
    const url = "/api/follow-up/customerAttitudeType";
    sendPost(
      url,
      params,
      {},
      (res: { data: any }) => {
        resolve(res.data.data);
      },
      (err: any) => {
        reject(err);
      }
    );
  });
}

//根据图片聊天
export const getMessageByImage = (params: object): Promise<any> => {
  return new Promise((resolve, reject) => {
    const url = "/llm/chat";
    sendPost(
      url,
      params,
      {},
      (res: any) => {
        resolve(res.data);
      },
      (err: any) => {
        reject(err);
      }
    );
  });
};

//风评数据
export const getCommentData = (params: object): Promise<any> => {
  return new Promise((resolve, reject) => {
    const url = "/api/evaluation/singleModel";
    sendPost(
      url,
      params,
      {},
      (res: any) => {
        resolve(res.data);
      },
      (err: any) => {
        reject(err);
      }
    );
  });
};
//根据图片聊天
export function getMessageByImageOther(params: object, onmessage: Function) {
  const url_qaStream = "/llamacpp/completion";
  let params_qa = params;
  handleFetchEventSource(url_qaStream, params_qa, onmessage);
}

// 产品风评分析-根据文件id获取渠道列表
export function selectAllChannel(fileId: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const url = `/api/evaluation/selectAllChannel/${fileId}`;
    sendGet(
      url,
      {},
      (res: { data: any }) => {
        resolve(res.data.data);
      },
      (err: any) => {
        reject(err);
      }
    );
  });
}

// 产品风评分析-风评多型号对比
export function multipleModel(fileId: string, channel: string): Promise<any> {
  let params = {
    fileId: fileId,
    channel: channel,
  };
  return new Promise((resolve, reject) => {
    const url = `/api/evaluation/multipleModel`;
    sendPost(
      url,
      params,
      {},
      (res: { data: any }) => {
        resolve(res.data.data);
      },
      (err: any) => {
        reject(err);
      }
    );
  });
}

// 多评价分析-获取产品类型列表
export function selectAllProductType(): Promise<any> {
  return new Promise((resolve, reject) => {
    const url = `/api/aw/evaluation/productType`;
    sendGet(
      url,
      {},
      (res: { data: any }) => {
        resolve(res.data.data);
      },
      (err: any) => {
        reject(err);
      }
    );
  });
}

// 多评价分析-获取统计表
export function statistics(fileId: string, productType: string): Promise<any> {
  let params = {
    fileId: fileId,
    productType: productType,
  };
  return new Promise((resolve, reject) => {
    const url = `/api/aw/evaluation/statistics`;
    sendPost(
      url,
      params,
      {},
      (res: { data: any }) => {
        resolve(res.data.data);
      },
      (err: any) => {
        reject(err);
      }
    );
  });
}

//aw分析文件
export function analysisAwFile(url: string, data: any) {
  return new Promise((resolve, reject) => {
    sendPost(
      url,
      data,
      {},
      (res: { data: any }) => {
        resolve(res.data);
      },
      (err: any) => {
        reject(err);
      }
    );
  });
}

//aw下载文件
export function downAwFile(url: string) {
  return new Promise((resolve, reject) => {
    sendGet(
      url,
      {},
      (res: { data: any }) => {
        resolve(res.data);
      },
      (err: any) => {
        reject(err);
      }
    );
  });
}
//aw下载文件post
export function downAwFilePost(url: string, data: any) {
  return new Promise((resolve, reject) => {
    sendPost(
      url,
      data,
      {},
      (res: { data: any }) => {
        resolve(res.data);
      },
      (err: any) => {
        reject(err);
      }
    );
  });
}



//日程助手-对话
export function getLLMChatCalendar(
  params: object,
  onmessage: Function,
  onclose: Function
) {
  const url_qaStream = "/data/conversation/qa";
  let params_qa = params;
  handleFetchEventSource(url_qaStream, params_qa, onmessage, onclose);
}

// 日程助手-获取日程信息
export function requestUserSchedule(userId: string): Promise<any> {
  return new Promise((resolve, reject) => {
    sendGet(
      `/data/calendar/schedule/${userId}`,
      {},
      (res: { data: any }) => {
        resolve(res.data.data);
      },
      (err: any) => {
        reject(err);
      }
    );
  });
}
// 日程助手-获取用户会话历史记录
export function requestUserSession(userId: string): Promise<any> {
  return new Promise((resolve, reject) => {
    sendPost(
      `/data/conversation/history`,
      { userId },
      {},
      (res: { data: any }) => {
        resolve(res.data.data);
      },
      (err: any) => {
        reject(err);
      }
    );
  });
}
// 日程助手-清空当前对话
export function deleteUserSession(
  userId: string,
  sessionId: string
): Promise<any> {
  return new Promise((resolve, reject) => {
    sendPost(
      `/data/conversation/clear`,
      {
        userId,
        sessionId,
      },
      {},
      (res: { data: any }) => {
        resolve(res.data);
      },
      (err: any) => {
        reject(err);
      }
    );
  });
}

// 登录接口
export function Login(params: any): Promise<any> {
  return new Promise((resolve, reject) => {
    sendPost(
      `/poc/user/login`,
      params,
      {},
      (res: { data: any }) => {
        resolve(res.data);
      },
      (err: any) => {
        console.log(err);
      }
    );
  });
}

// 注册接口
export function RegisterUser(params: any): Promise<any> {
  return new Promise((resolve, reject) => {
    sendPost(
      `/poc/user/registerUser`,
      params,
      {},
      (res: { data: any }) => {
        resolve(res.data);
      },
      (err: any) => {
        reject(err);
      }
    );
  });
}

// 退出登录
export function LoginOut(params: any): Promise<any> {
  return new Promise((resolve, reject) => {
    sendGet(
      `/poc/user/logout`,
      { token: params },
      (res: { data: any }) => {
        resolve(res.data);
      },
      (err: any) => {
        reject(err);
      }
    );
  });
}

//新平台对话
export function getNewLLMChat(params: object, onmessage: Function) {
  const url_qaStream = "/poc/chat/sendMessage";
  let params_qa = params;
  handleFetchEventSource(url_qaStream, params_qa, onmessage);
}

// 获取最近应用
export function GetRecentList(params: any): Promise<any> {
  return new Promise((resolve, reject) => {
    sendPost(
      `/poc/app/recentList`,
      params,
      {},
      (res: { data: any }) => {
        resolve(res.data);
      },
      (err: any) => {
        reject(err);
      }
    );
  });
}
// 应用列表
export function GetAppList(params: any): Promise<any> {
  return new Promise((resolve, reject) => {
    sendPost(
      `/poc/app/list`,
      params,
      {},
      (res: { data: any }) => {
        resolve(res.data);
      },
      (err: any) => {
        reject(err);
      }
    );
  });
}

// 查询应用类型
export function GetAppTypeList(): Promise<any> {
  return new Promise((resolve, reject) => {
    sendGet(
      `/poc/app/appTypeList`,
      {},
      (res: { data: any }) => {
        resolve(res.data);
      },
      (err: any) => {
        reject(err);
      }
    );
  });
}

// 收藏
export function SetAppFavorite(params: any): Promise<any> {
  return new Promise((resolve, reject) => {
    sendPost(
      `/poc/app/favorite`,
      params,
      {},
      (res: { data: any }) => {
        resolve(res.data);
      },
      (err: any) => {
        reject(err);
      }
    );
  });
}

// 取消收藏
export function SetAppCancelFavorite(params: any): Promise<any> {
  return new Promise((resolve, reject) => {
    sendPost(
      `/poc/app/cancelFavorite`,
      params,
      {},
      (res: { data: any }) => {
        resolve(res.data);
      },
      (err: any) => {
        reject(err);
      }
    );
  });
}
// 获取最近对话
export function GetRecentDialogList(params: any): Promise<any> {
  return new Promise((resolve, reject) => {
    sendPost(
      `/poc/app/recentDialogueList`,
      params,
      {},
      (res: { data: any }) => {
        resolve(res.data);
      },
      (err: any) => {
        reject(err);
      }
    );
  });
}
// 创建应用

export function AddApp(params: any): Promise<any> {
  return new Promise((resolve, reject) => {
    sendPost(
      `/poc/app/add`,
      params,
      {},
      (res: { data: any }) => {
        resolve(res.data);
      },
      (err: any) => {
        reject(err);
      }
    );
  });
}
// 更新应用
export function UpdateApp(params: any): Promise<any> {
  return new Promise((resolve, reject) => {
    sendPost(
      `/poc/app/update`,
      params,
      {},
      (res: { data: any }) => {
        resolve(res.data);
      },
      (err: any) => {
        reject(err);
      }
    );
  });
}
//获取对话列表
export function talkListInfo(params: any): Promise<any> {
  return new Promise((resolve, reject) => {
    sendPost(
      `/poc/app/dialogueContentList`,
      params,
      {},
      (res: { data: any }) => {
        resolve(res.data);
      },
      (err: any) => {
        reject(err);
      }
    );
  });
}

//获取应用对话列表
export function appListInfo(params: any): Promise<any> {
  return new Promise((resolve, reject) => {
    sendPost(
      `/poc/app/appDialogueContentList`,
      params,
      {},
      (res: { data: any }) => {
        resolve(res.data);
      },
      (err: any) => {
        reject(err);
      }
    );
  });
}

// 删除应用
export function DelApp(url: any): Promise<any> {
  return new Promise((resolve, reject) => {
    sendPost(
      `/poc/app/deleteApp?appId=${url}`,
      {},
      {},
      (res: { data: any }) => {
        resolve(res.data);
      },
      (err: any) => {
        reject(err);
      }
    );
  });
}
// 删除最近对话
export function DelTalk(url: any): Promise<any> {
  return new Promise((resolve, reject) => {
    sendPost(
      `/poc/app/deleteDialogueRecord?id=${url}`,
      {},
      {},
      (res: { data: any }) => {
        resolve(res.data);
      },
      (err: any) => {
        reject(err);
      }
    );
  });
}
// 删除最近应用
export function DelDialoApp(url: any): Promise<any> {
  return new Promise((resolve, reject) => {
    sendPost(
      `/poc/app/deleteAppDialogueRecord?id=${url}`,
      {},
      {},
      (res: { data: any }) => {
        resolve(res.data);
      },
      (err: any) => {
        reject(err);
      }
    );
  });
}

// 对话 - 文档大师（流式）
export function docMasterChat(params: object) {
  const url_qaStream = "/doc-master/doc/chat/completions/stream";
  const fetchSSE = new FetchSSE(url_qaStream, params)
  return fetchSSE
}

// 从知识库中删除文档
export function deleteDoc(index_id: string, doc_ids: Array<string>): Promise<any> {
  return new Promise((resolve, reject) => {
    sendPost(
      `/doc-master/doc/document/delete`,
      { index_id: index_id, doc_ids: doc_ids },
      {},
      (res: { data: any }) => {
        resolve(res.data);
      },
      (err: any) => {
        reject(err);
      }
    );
  });
}

// 查看参考来源
export function referencesFetch(index_id: string, node_ids: Array<string>): Promise<any> {
  return new Promise((resolve, reject) => {
    sendPost(
      `/doc-master/doc/references/fetch`,
      { index_id: index_id, node_ids: node_ids },
      {},
      (res: { data: any }) => {
        resolve(res.data);
      },
      (err: any) => {
        reject(err);
      }
    );
  });
}

// 批量上传文件
export function UploadFileMultipart(params: FormData): Promise<any> {
  return new Promise((resolve, reject) => {
    sendPost(
      `/doc-master/doc/upload`,
      params,
      { "Content-Type": "multipart/form-data" },
      (res: { data: any }) => {
        resolve(res.data);
      },
      (err: any) => {
        reject(err);
      }
    );
  });
}

export type Doc = {
  doc_url: string;
  doc_name: string;
  doc_size: string;
}
// 从url中获取文档信息，并调用文档大师的api
export function uploadDocByUrl(docs: Array<Doc>): Promise<any> {
  return new Promise((resolve, reject) => {
    sendPost(
      `/doc-master/doc/document/url`,
      { docs },
      {},
      (res: { data: any }) => {
        resolve(res.data);
      },
      (err: any) => {
        reject(err);
      }
    );
  });
}

// 文档分析和文档上传 的 type
export type DocumentResult = {
  user_id?: string;
  index_id?: string;
  doc_name?: string;
  doc_id?: string;
  doc_url?: string;
  doc_size?: string;
  text_splitter?: any;
  content_length?: number;
  status?: number;
  created_at?: string;
  executed_at?: string;
  executed_id?: string;
  executed_note?: string;
}

// 根据知识库id，查询文档列表状态
export function getDocListStatus(index_id: string, page?: number, size?: number): Promise<any> {
  return new Promise((resolve, reject) => {
    sendPost(
      `/doc-master/doc/document/list`,
      { index_id: index_id, page: page, size: size },
      {},
      (res: { data: any }) => {
        resolve(res.data);
      },
      (err: any) => {
        reject(err);
      }
    );
  });
}

// 历史对话
export type History = {
  index_id: string;
  title: string;
  createTime: string;
  docs?: Array<DocumentResult>;
}

// 根据用户id，查询文档列表状态
export function getHistory(user_id: string): Promise<any> {
  return new Promise((resolve, reject) => {
    sendPost(
      `/doc-master/doc/chat/history`,
      { userId: user_id },
      {},
      (res: { data: Array<History> }) => {
        resolve(res.data);
      },
      (err: any) => {
        reject(err);
      }
    );
  });
}

// 修改历史记录标题
export function editHistoryTitle(index_id: string, title: string): Promise<any> {
  return new Promise((resolve, reject) => {
    sendPost(
      `/doc-master/doc/chat/history/updateTitle`,
      { index_id: index_id, title: title },
      {},
      (res: { data: any }) => {
        resolve(res.data);
      },
      (err: any) => {
        reject(err);
      }
    );
  });
}

// 删除历史记录标题
export function removeHistoryById(index_id: string): Promise<any> {
  return new Promise((resolve, reject) => {
    sendGet(
      `/doc-master/doc/chat/history/delete/${index_id}`,
      {},
      (res: { data: any }) => {
        resolve(res.data);
      },
      (err: any) => {
        reject(err);
      }
    );
  });
}

// 根据index_id获取对话详情
export function getDialogueDetailById(index_id: string): Promise<any> {
  return new Promise((resolve, reject) => {
    sendGet(
      `/doc-master/doc/chat/history/detail/${index_id}`,
      {},
      (res: { data: any }) => {
        resolve(res.data);
      },
      (err: any) => {
        reject(err);
      }
    );
  });
}