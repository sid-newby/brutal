# Gemini API quickstart 
## Use Genai as the sdk for Gemini. Use VertexAI for gcloud auth application-default login. 
(npm i @google/generative-ai) + (npm i @google-cloud/vertexai)
This quickstart shows you how to install your SDK of choice and then make your first Gemini API request.
Python Node.js REST Go

## Install the Gemini API library
**Note:** We're rolling out a new set of Gemini API libraries, the [Google Gen AI SDK](https://ai.google.dev/gemini-api/docs/sdks).
Using [Node.js v18+](https://nodejs.org/en/download/package-manager), install the [`GoogleGenerativeAI` package](https://www.npmjs.com/package/@google/generative-ai) using the following [npm command](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm):

```
npm install @google/generative-ai
```

## Make your first request:  Before you begin

1. Make sure your node.js version is 18 or above.
2. [Select](https://console.cloud.google.com/project) or [create](https://cloud.google.com/resource-manager/docs/creating-managing-projects#creating_a_project) a Google Cloud project.
3. [Enable billing for your project](https://cloud.google.com/billing/docs/how-to/modify-project).
4. [Enable the Vertex AI API](https://console.cloud.google.com/flows/enableapi?apiid=aiplatform.googleapis.com).
5. [Install the gcloud CLI](https://cloud.google.com/sdk/docs/install).
6. [Initialize the gcloud CLI](https://cloud.google.com/sdk/docs/initializing).
    
7. Create local authentication credentials for your user account:
    
    ```shell
    gcloud auth application-default login
    ```
    

A list of accepted authentication options are listed in [GoogleAuthOptions](https://github.com/googleapis/google-auth-library-nodejs/blob/3ae120d0a45c95e36c59c9ac8286483938781f30/src/auth/googleauth.ts#L87) interface of google-auth-library-node.js GitHub repo.

1. Official documentation is available in the [Vertex AI SDK Overview](https://cloud.google.com/vertex-ai/generative-ai/docs/reference/nodejs/latest/overview) page. From here, a complete list of documentation on classes, interfaces, and enums are available.

## Install the SDK



Install the Vertex AI SDK for Node.js by running the following command:

```shell
pnpm install @google-cloud/vertexai
pnpm install @google/generative-ai
```
Use the [`generateContent`](https://ai.google.dev/api/generate-content#method:-models.generatecontent) method to send a request to the Gemini API.

```
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI("YOUR_API_KEY");
const model = genAI.getGenerativeModel({ model: "gemini-2.0-pro-exp-02-05" });

const prompt = "Explain how AI works";

const result = await model.generateContent(prompt);
console.log(result.response.text());
```



# Text generation

Python Node.js Go REST

The Gemini API can generate text output when provided text, images, video, and audio as input.

This guide shows you how to generate text using the [`generateContent`](https://ai.google.dev/api/rest/v1/models/generateContent) and [`streamGenerateContent`](https://ai.google.dev/api/rest/v1/models/streamGenerateContent) methods. To learn about working with Gemini's vision and audio capabilities, refer to the [Vision](https://ai.google.dev/gemini-api/docs/vision) and [Audio](https://ai.google.dev/gemini-api/docs/audio) guides.

## Generate text from text-only input

The simplest way to generate text using the Gemini API is to provide the model with a single text-only input, as shown in this example:

```
import { GoogleGenerativeAI } from "@google/generative-ai";
const genAI = new GoogleGenerativeAI("GEMINI_API_KEY");

const model = genAI.getGenerativeModel({ model: "gemini-2.0-pro-exp-02-05" });

const prompt = "Explain how AI works";

const result = await model.generateContent(prompt);
console.log(result.response.text());
```

In this case, the prompt ("Explain how AI works") doesn't include any output examples, system instructions, or formatting information. It's a [zero-shot](https://ai.google.dev/gemini-api/docs/models/generative-models#zero-shot-prompts) approach. For some use cases, a [one-shot](https://ai.google.dev/gemini-api/docs/models/generative-models#one-shot-prompts) or [few-shot](https://ai.google.dev/gemini-api/docs/models/generative-models#few-shot-prompts) prompt might produce output that's more aligned with user expectations. In some cases, you might also want to provide [system instructions](https://ai.google.dev/gemini-api/docs/text-generation#system-instructions) to help the model understand the task or follow specific guidelines.

## Generate text from text-and-image input

The Gemini API supports multimodal inputs that combine text with media files. The following example shows how to generate text from text-and-image input:

```
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as fs from 'node:fs';

const genAI = new GoogleGenerativeAI("GEMINI_API_KEY");
const model = genAI.getGenerativeModel({ model: "gemini-2.0-pro-exp-02-05" });

function fileToGenerativePart(path, mimeType) {
  return {
    inlineData: {
      data: Buffer.from(fs.readFileSync(path)).toString("base64"),
      mimeType,
    },
  };
}

const prompt = "Describe how this product might be manufactured.";
const imagePart = fileToGenerativePart("/path/to/image.png", "image/png");

const result = await model.generateContent([prompt, imagePart]);
console.log(result.response.text());
```

## Generate a text stream

By default, the model returns a response after completing the entire text generation process. You can achieve faster interactions by not waiting for the entire result, and instead use streaming to handle partial results.

The following example shows how to implement streaming using the [`streamGenerateContent`](https://ai.google.dev/api/rest/v1/models/streamGenerateContent) method to generate text from a text-only input prompt.

```
import { GoogleGenerativeAI } from "@google/generative-ai";
const genAI = new GoogleGenerativeAI("GEMINI_API_KEY");
const model = genAI.getGenerativeModel({ model: "gemini-2.0-pro-exp-02-05" });

const prompt = "Explain how AI works";

const result = await model.generateContentStream(prompt);

for await (const chunk of result.stream) {
  const chunkText = chunk.text();
  process.stdout.write(chunkText);
}
```

## Create a chat conversation

The Gemini SDK lets you collect multiple rounds of questions and responses, allowing users to step incrementally toward answers or get help with multipart problems. This SDK feature provides an interface to keep track of conversations history, but behind the scenes uses the same `generateContent` method to create the response.

The following code example shows a basic chat implementation:

```
import { GoogleGenerativeAI } from "@google/generative-ai";
const genAI = new GoogleGenerativeAI("GEMINI_API_KEY");
const model = genAI.getGenerativeModel({ model: "gemini-2.0-pro-exp-02-05" });
const chat = model.startChat({
  history: [
    {
      role: "user",
      parts: [{ text: "Hello" }],
    },
    {
      role: "model",
      parts: [{ text: "Great to meet you. What would you like to know?" }],
    },
  ],
});

let result = await chat.sendMessage("I have 2 dogs in my house.");
console.log(result.response.text());
let result2 = await chat.sendMessage("How many paws are in my house?");
console.log(result2.response.text());
```

You can also use streaming with chat, as shown in the following example:

```
import { GoogleGenerativeAI } from "@google/generative-ai";
const genAI = new GoogleGenerativeAI("GEMINI_API_KEY");
const model = genAI.getGenerativeModel({ model: "gemini-2.0-pro-exp-02-05" });

const chat = model.startChat({
  history: [
    {
      role: "user",
      parts: [{ text: "Hello" }],
    },
    {
      role: "model",
      parts: [{ text: "Great to meet you. What would you like to know?" }],
    },
  ],
});

let result = await chat.sendMessageStream("I have 2 dogs in my house.");
for await (const chunk of result.stream) {
  const chunkText = chunk.text();
  process.stdout.write(chunkText);
}
let result2 = await chat.sendMessageStream("How many paws are in my house?");
for await (const chunk of result2.stream) {
  const chunkText = chunk.text();
  process.stdout.write(chunkText);
}
```

## Configure text generation

Every prompt you send to the model includes parameters that control how the model generates responses. You can use [`GenerationConfig`](https://ai.google.dev/api/rest/v1/GenerationConfig) to configure these parameters. If you don't configure the parameters, the model uses default options, which can vary by model.

The following example shows how to configure several of the available options.

```
import { GoogleGenerativeAI } from "@google/generative-ai";
const genAI = new GoogleGenerativeAI("GEMINI_API_KEY");

const model = genAI.getGenerativeModel({ model: "gemini-2.0-pro-exp-02-05" });

const result = await model.generateContent({
    contents: [
        {
          role: 'user',
          parts: [
            {
              text: "Explain how AI works",
            }
          ],
        }
    ],
    generationConfig: {
      maxOutputTokens: 1000,
      temperature: 0.1,
    }
});

console.log(result.response.text());
```

## Add system instructions

System instructions let you steer the behavior of a model based on your specific needs and use cases.

By giving the model system instructions, you provide the model additional context to understand the task, generate more customized responses, and adhere to specific guidelines over the full user interaction with the model. You can also specify product-level behavior by setting system instructions, separate from prompts provided by end users.

You can set system instructions when you initialize your model:

```
// Set the system instruction during model initialization
const model = genAI.getGenerativeModel({
  model: "gemini-2.0-pro-exp-02-05",
  systemInstruction: "You are a cat. Your name is Neko.",
});
```

Then, you can send requests to the model as usual.




# Explore vision capabilities with the Gemini API

Python Node.js Go REST

Gemini models are able to process images and videos, enabling many frontier developer use cases that would have historically required domain specific models. Some of Gemini's vision capabilities include the ability to:

- Caption and answer questions about images
- Transcribe and reason over PDFs, including up to 2 million tokens
- Describe, segment, and extract information from videos up to 90 minutes long
- Detect objects in an image and return bounding box coordinates for them

Gemini was built to be multimodal from the ground up and we continue to push the frontier of what is possible.

## Image input

For total image payload size less than 20MB, we recommend either uploading base64 encoded images or directly uploading locally stored image files.

### Working with local images

If you have the files you want to send to Gemini locally, you can directly pass them in the request to the model:

```
import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Converts local file information to base64
function fileToGenerativePart(path, mimeType) {
  return {
    inlineData: {
      data: Buffer.from(fs.readFileSync(path)).toString("base64"),
      mimeType
    },
  };
}

async function run() {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

  const prompt = "Write an advertising jingle showing how the product in the first image could solve the problems shown in the second two images.";

  const imageParts = [
    fileToGenerativePart("jetpack.jpg", "image/jpeg"),
    fileToGenerativePart("piranha.jpg", "image/jpeg"),
  ];

  const generatedContent = await model.generateContent([prompt, ...imageParts]);
  
  console.log(generatedContent.response.text());
}

run();
```

Note that these inline data calls don't include many of the features available through the File API, such as getting file metadata, [listing](https://ai.google.dev/gemini-api/docs/vision?lang=node#list-files), or [deleting files](https://ai.google.dev/gemini-api/docs/vision?lang=node#delete-files).

### Base64 encoded images

You can upload public image URLs by encoding them as Base64 payloads. We recommend using the httpx library to fetch the image URLs. The following code example shows how to do this:

```
import { GoogleGenerativeAI } from "@google/generative-ai";

// Access your API key as an environment variable (see "Set up your API key" above)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({ model: 'models/gemini-1.5-pro' });

const imageResp = await fetch(
    'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Palace_of_Westminster_from_the_dome_on_Methodist_Central_Hall.jpg/2560px-Palace_of_Westminster_from_the_dome_on_Methodist_Central_Hall.jpg'
)
    .then((response) => response.arrayBuffer());

const result = await model.generateContent([
    {
        inlineData: {
            data: Buffer.from(imageResp).toString("base64"),
            mimeType: "image/jpeg",
        },
    },
    'Caption this image.',
]);
console.log(result.response.text());
```

### Multiple images

To prompt with multiple images in Base64 encoded format, you can do the following:

```
import { GoogleGenerativeAI } from "@google/generative-ai";

// Access your API key as an environment variable (see "Set up your API key" above)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({ model: 'models/gemini-1.5-pro' });

const imageResp1 = await fetch(IMAGE_PATH_1).then((response) => response.arrayBuffer());
const imageResp2 = await fetch(IMAGE_PATH_2).then((response) => response.arrayBuffer());

const result = await model.generateContent([
    {
        inlineData: {
            data: Buffer.from(imageResp1).toString("base64"),
            mimeType: "image/jpeg",
        },
    },
    {
        inlineData: {
            data: Buffer.from(imageResp2).toString("base64"),
            mimeType: "image/jpeg",
        },
    },
    'Generate a list of all the objects contained in both images.',
]);
console.log(result.response.text());

```

### Upload an image and generate content

When the combination of files and system instructions that you intend to send is larger than 20 MB in size, use the File API to upload those files.

Use the [`media.upload`](https://ai.google.dev/api/rest/v1beta/media/upload) method of the File API to upload an image of any size.

**Note:** The File API lets you store up to 20 GB of files per project, with a per-file maximum size of 2 GB. Files are stored for 48 hours. They can be accessed in that period with your API key, but cannot be downloaded from the API. It is available at no cost in all regions where the Gemini API is available.

After uploading the file, you can make `GenerateContent` requests that reference the File API URI. Select the generative model and provide it with a text prompt and the uploaded image.

```
// Make sure to include these imports:
// import { GoogleAIFileManager } from "@google/generative-ai/server";
// import { GoogleGenerativeAI } from "@google/generative-ai";
const fileManager = new GoogleAIFileManager(process.env.API_KEY);

const uploadResult = await fileManager.uploadFile(
  `${mediaPath}/jetpack.jpg`,
  {
    mimeType: "image/jpeg",
    displayName: "Jetpack drawing",
  },
);
// View the response.
console.log(
  `Uploaded file ${uploadResult.file.displayName} as: ${uploadResult.file.uri}`,
);

// Polling getFile to check processing complete
let file = await fileManager.getFile(uploadResult.file.name);
while (file.state === FileState.PROCESSING) {
  process.stdout.write(".");
  // Sleep for 10 seconds
  await new Promise((resolve) => setTimeout(resolve, 10_000));
  // Fetch the file from the API again
  file = await fileManager.getFile(uploadResult.file.name);
}
if (file.state === FileState.FAILED) {
  throw new Error("Audio processing failed.");
}

const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-pro-exp-02-05" });
const result = await model.generateContent([
  "Tell me about this image.",
  {
    fileData: {
      fileUri: uploadResult.file.uri,
      mimeType: uploadResult.file.mimeType,
    },
  },
]);
console.log(result.response.text());files.js
```

### Verify image file upload and get metadata

You can verify the API successfully stored the uploaded file and get its metadata by calling [`files.get`](https://ai.google.dev/api/rest/v1beta/files/get). Only the `name` (and by extension, the `uri`) are unique.

```
// Make sure to include these imports:
// import { GoogleAIFileManager } from "@google/generative-ai/server";
const fileManager = new GoogleAIFileManager(process.env.API_KEY);

const uploadResponse = await fileManager.uploadFile(
  `${mediaPath}/jetpack.jpg`,
  {
    mimeType: "image/jpeg",
    displayName: "Jetpack drawing",
  },
);

// Get the previously uploaded file's metadata.
const getResponse = await fileManager.getFile(uploadResponse.file.name);

// View the response.
console.log(
  `Retrieved file ${getResponse.displayName} as ${getResponse.uri}`,
);files.js
```

### OpenAI Compatibility

You can access Gemini's image understanding capabilities using the OpenAI libraries. This lets you integrate Gemini into existing OpenAI workflows by updating three lines of code and using your Gemini API key. See the [Image understanding example](https://ai.google.dev/gemini-api/docs/openai#image-understanding) for code demonstrating how to send images encoded as Base64 payloads.

## Prompting with images

In this tutorial, you will upload images using the File API or as inline data and generate content based on those images.

### Technical details (images)

Gemini 2.0 Flash, 1.5 Pro, and 1.5 Flash support a maximum of 3,600 image files.

Images must be in one of the following image data MIME types:

- PNG - `image/png`
- JPEG - `image/jpeg`
- WEBP - `image/webp`
- HEIC - `image/heic`
- HEIF - `image/heif`

#### Tokens

Here's how tokens are calculated for images:

- **Gemini 1.0 Pro Vision**: Each image accounts for 258 tokens.
- **Gemini 1.5 Flash and Gemini 1.5 Pro**: If both dimensions of an image are less than or equal to 384 pixels, then 258 tokens are used. If one dimension of an image is greater than 384 pixels, then the image is cropped into tiles. Each tile size defaults to the smallest dimension (width or height) divided by 1.5. If necessary, each tile is adjusted so that it's not smaller than 256 pixels and not greater than 768 pixels. Each tile is then resized to 768x768 and uses 258 tokens.
- **Gemini 2.0 Flash**: Image inputs with both dimensions <=384 pixels are counted as 258 tokens. Images larger in one or both dimensions are cropped and scaled as needed into tiles of 768x768 pixels, each counted as 258 tokens.

#### For best results

- Rotate images to the correct orientation before uploading.
- Avoid blurry images.
- If using a single image, place the text prompt after the image.

## Capabilities

This section outlines specific vision capabilities of the Gemini model, including object detection and bounding box coordinates.

### Get a bounding box for an object

Gemini models are trained to return bounding box coordinates as relative widths or heights in the range of [0, 1]. These values are then scaled by 1000 and converted to integers. Effectively, the coordinates represent the bounding box on a 1000x1000 pixel version of the image. Therefore, you'll need to convert these coordinates back to the dimensions of your original image to accurately map the bounding boxes.

```
// filePart = ...
// filePart2 has the piranha.

async function findBox(filePart) {
  // Choose a Gemini model.
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

  const prompt = "Return a bounding box for the piranha. \n [ymin, xmin, ymax, xmax]";

  const generatedContent = await model.generateContent([prompt, filePart]);
  
  console.log(generatedContent.response.text());
}

run(filePart);
```

You can use bounding boxes for object detection and localization within images and video. By accurately identifying and delineating objects with bounding boxes, you can unlock a wide range of applications and enhance the intelligence of your projects.

#### Key Benefits

- **Simple:** Integrate object detection capabilities into your applications with ease, regardless of your computer vision expertise.
- **Customizable:** Produce bounding boxes based on custom instructions (e.g. "I want to see bounding boxes of all the green objects in this image"), without having to train a custom model.

#### Technical Details

- **Input:** Your prompt and associated images or video frames.
- **Output:** Bounding boxes in the `[y_min, x_min, y_max, x_max]` format. The top left corner is the origin. The `x` and `y` axis go horizontally and vertically, respectively. Coordinate values are normalized to 0-1000 for every image.
- **Visualization:** AI Studio users will see bounding boxes plotted within the UI.

For Python developers, try the [2D spatial understanding notebook](https://github.com/google-gemini/cookbook/blob/main/quickstarts/Spatial_understanding.ipynb) or the [experimental 3D pointing notebook](https://github.com/google-gemini/cookbook/blob/main/examples/Spatial_understanding_3d.ipynb).

#### Normalize coordinates

The model returns bounding box coordinates in the format `[y_min, x_min, y_max, x_max]`. To convert these normalized coordinates to the pixel coordinates of your original image, follow these steps:

1. Divide each output coordinate by 1000.
2. Multiply the x-coordinates by the original image width.
3. Multiply the y-coordinates by the original image height.

## Prompting with video

In this tutorial, you will upload a video using the File API and generate content based on those images.

**Note:** The File API is required to upload video files, due to their size. However, the File API is only available for Python, Node.js, Go, and REST.

### Technical details (video)

Gemini 1.5 Pro and Flash support up to approximately an hour of video data.

Video must be in one of the following video format MIME types:

- `video/mp4`
- `video/mpeg`
- `video/mov`
- `video/avi`
- `video/x-flv`
- `video/mpg`
- `video/webm`
- `video/wmv`
- `video/3gpp`

The File API service extracts image frames from videos at 1 frame per second (FPS) and audio at 1Kbps, single channel, adding timestamps every second. These rates are subject to change in the future for improvements in inference.

**Note:** The details of fast action sequences may be lost at the 1 FPS frame sampling rate. Consider slowing down high-speed clips for improved inference quality.

Individual frames are 258 tokens, and audio is 32 tokens per second. With metadata, each second of video becomes ~300 tokens, which means a 1M context window can fit slightly less than an hour of video.

To ask questions about time-stamped locations, use the format `MM:SS`, where the first two digits represent minutes and the last two digits represent seconds.

For best results:

- Use one video per prompt.
- If using a single video, place the text prompt after the video.

### Upload a video file using the File API

**Note:** The File API lets you store up to 20 GB of files per project, with a per-file maximum size of 2 GB. Files are stored for 48 hours. They can be accessed in that period with your API key, but they cannot be downloaded using any API. It is available at no cost in all regions where the Gemini API is available.

The File API accepts video file formats directly. This example uses the short NASA film ["Jupiter's Great Red Spot Shrinks and Grows"](https://www.youtube.com/watch?v=JDi4IdtvDVE0). Credit: Goddard Space Flight Center (GSFC)/David Ladd (2018).

"Jupiter's Great Red Spot Shrinks and Grows" is in the public domain and does not show identifiable people. ([NASA image and media usage guidelines.](https://www.nasa.gov/nasa-brand-center/images-and-media/))

Start by retrieving the short video:

```
wget https://storage.googleapis.com/generativeai-downloads/images/GreatRedSpot.mp4
```

Upload the video using the File API and print the URI.

```
// To use the File API, use this import path for GoogleAIFileManager.
// Note that this is a different import path than what you use for generating content.
// For versions lower than @google/generative-ai@0.13.0
// use "@google/generative-ai/files"
import { GoogleAIFileManager } from "@google/generative-ai/server";

// Initialize GoogleAIFileManager with your GEMINI_API_KEY.
const fileManager = new GoogleAIFileManager(process.env.GEMINI_API_KEY);

// Upload the file and specify a display name.
const uploadResponse = await fileManager.uploadFile("GreatRedSpot.mp4", {
  mimeType: "video/mp4",
  displayName: "Jupiter's Great Red Spot",
});

// View the response.
console.log(`Uploaded file ${uploadResponse.file.displayName} as: ${uploadResponse.file.uri}`);
```

### Verify file upload and check state

Verify the API has successfully received the files by calling the [`files.get`](https://ai.google.dev/api/rest/v1beta/files/get) method.

**Note:** Video files have a `State` field in the File API. When a video is uploaded, it will be in the `PROCESSING` state until it is ready for inference. **Only `ACTIVE` files can be used for model inference.**

```
// To use the File API, use this import path for GoogleAIFileManager.
// Note that this is a different import path than what you use for generating content.
// For versions lower than @google/generative-ai@0.13.0
// use "@google/generative-ai/files"
import { GoogleAIFileManager, FileState } from "@google/generative-ai/server";

// Initialize GoogleAIFileManager with your GEMINI_API_KEY.
const fileManager = new GoogleAIFileManager(process.env.GEMINI_API_KEY);

// Upload the video file using the File API
// uploadResponse = ...
const name = uploadResponse.file.name;

// Poll getFile() on a set interval (10 seconds here) to check file state.
let file = await fileManager.getFile(name);
while (file.state === FileState.PROCESSING) {
  process.stdout.write(".")
  // Sleep for 10 seconds
  await new Promise((resolve) => setTimeout(resolve, 10_000));
  // Fetch the file from the API again
  file = await fileManager.getFile(name)
}

if (file.state === FileState.FAILED) {
  throw new Error("Video processing failed.");
}

// When file.state is ACTIVE, the file is ready to be used for inference.
console.log(`File ${file.displayName} is ready for inference as ${file.uri}`);

```

### Prompt with a video and text

Once the uploaded video is in the `ACTIVE` state, you can make `GenerateContent` requests that specify the File API URI for that video. Select the generative model and provide it with the uploaded video and a text prompt.

```
// To generate content, use this import path for GoogleGenerativeAI.
// Note that this is a different import path than what you use for the File API.
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize GoogleGenerativeAI with your GEMINI_API_KEY.
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Choose a Gemini model.
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-pro",
});

// Upload the video file using the File API
// uploadResponse = ...

// Generate content using text and the URI reference for the uploaded file.
const result = await model.generateContent([
    {
      fileData: {
        mimeType: uploadResponse.file.mimeType,
        fileUri: uploadResponse.file.uri
      }
    },
    { text: "Summarize this video. Then create a quiz with answer key based on the information in the video." },
  ]);

// Handle the response of generated text
console.log(result.response.text())

```

### Refer to timestamps in the content

You can use timestamps of the form `MM:SS` to refer to specific moments in the video.

```
// To generate content, use this import path for GoogleGenerativeAI.
// Note that this is a different import path than what you use for the File API.
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize GoogleGenerativeAI with your GEMINI_API_KEY.
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Choose a Gemini model.
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-pro",
});

// Upload the video file using the File API
// uploadResponse = ...

// Generate content using text and the URI reference for the uploaded file.
const result = await model.generateContent([
    {
      fileData: {
        mimeType: uploadResponse.file.mimeType,
        fileUri: uploadResponse.file.uri
      }
    },
    { text: "What are the examples given at 01:05 and 01:19 supposed to show us?" },
  ]);

// Handle the response of generated text
console.log(result.response.text())

```

### Transcribe video and provide visual descriptions

If the video is not fast-paced (only 1 frame per second of video is sampled), it's possible to transcribe the video with visual descriptions for each shot.

```
// To generate content, use this import path for GoogleGenerativeAI.
// Note that this is a different import path than what you use for the File API.
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize GoogleGenerativeAI with your GEMINI_API_KEY.
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Choose a Gemini model.
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-pro",
});

// Upload the video file using the File API
// uploadResponse = ...

// Generate content using text and the URI reference for the uploaded file.
const result = await model.generateContent([
    {
      fileData: {
        mimeType: uploadResponse.file.mimeType,
        fileUri: uploadResponse.file.uri
      }
    },
    { text: "Transcribe the audio, giving timestamps. Also provide visual descriptions." },
  ]);

// Handle the response of generated text
console.log(result.response.text())

```

## List files

You can list all files uploaded using the File API and their URIs using [`files.list`](https://ai.google.dev/api/files#method:-files.list).

```
// Make sure to include these imports:
// import { GoogleAIFileManager } from "@google/generative-ai/server";
const fileManager = new GoogleAIFileManager(process.env.API_KEY);

const listFilesResponse = await fileManager.listFiles();

// View the response.
for (const file of listFilesResponse.files) {
  console.log(`name: ${file.name} | display name: ${file.displayName}`);
}files.js
```

## Delete files

Files uploaded using the File API are automatically deleted after 2 days. You can also manually delete them using [`files.delete`](https://ai.google.dev/api/files#method:-files.delete).

```
// Make sure to include these imports:
// import { GoogleAIFileManager } from "@google/generative-ai/server";
const fileManager = new GoogleAIFileManager(process.env.API_KEY);

const uploadResult = await fileManager.uploadFile(
  `${mediaPath}/jetpack.jpg`,
  {
    mimeType: "image/jpeg",
    displayName: "Jetpack drawing",
  },
);

// Delete the file.
await fileManager.deleteFile(uploadResult.file.name);

console.log(`Deleted ${uploadResult.file.displayName}`);files.js
```





# Text generation

Python Node.js Go REST

The Gemini API can generate text output when provided text, images, video, and audio as input.

This guide shows you how to generate text using the [`generateContent`](https://ai.google.dev/api/rest/v1/models/generateContent) and [`streamGenerateContent`](https://ai.google.dev/api/rest/v1/models/streamGenerateContent) methods. To learn about working with Gemini's vision and audio capabilities, refer to the [Vision](https://ai.google.dev/gemini-api/docs/vision) and [Audio](https://ai.google.dev/gemini-api/docs/audio) guides.

## Generate text from text-only input

The simplest way to generate text using the Gemini API is to provide the model with a single text-only input, as shown in this example:

```
import { GoogleGenerativeAI } from "@google/generative-ai";
const genAI = new GoogleGenerativeAI("GEMINI_API_KEY");

const model = genAI.getGenerativeModel({ model: "gemini-2.0-pro-exp-02-05" });

const prompt = "Explain how AI works";

const result = await model.generateContent(prompt);
console.log(result.response.text());
```

In this case, the prompt ("Explain how AI works") doesn't include any output examples, system instructions, or formatting information. It's a [zero-shot](https://ai.google.dev/gemini-api/docs/models/generative-models#zero-shot-prompts) approach. For some use cases, a [one-shot](https://ai.google.dev/gemini-api/docs/models/generative-models#one-shot-prompts) or [few-shot](https://ai.google.dev/gemini-api/docs/models/generative-models#few-shot-prompts) prompt might produce output that's more aligned with user expectations. In some cases, you might also want to provide [system instructions](https://ai.google.dev/gemini-api/docs/text-generation#system-instructions) to help the model understand the task or follow specific guidelines.

## Generate text from text-and-image input

The Gemini API supports multimodal inputs that combine text with media files. The following example shows how to generate text from text-and-image input:

```
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as fs from 'node:fs';

const genAI = new GoogleGenerativeAI("GEMINI_API_KEY");
const model = genAI.getGenerativeModel({ model: "gemini-2.0-pro-exp-02-05" });

function fileToGenerativePart(path, mimeType) {
  return {
    inlineData: {
      data: Buffer.from(fs.readFileSync(path)).toString("base64"),
      mimeType,
    },
  };
}

const prompt = "Describe how this product might be manufactured.";
const imagePart = fileToGenerativePart("/path/to/image.png", "image/png");

const result = await model.generateContent([prompt, imagePart]);
console.log(result.response.text());
```

## Generate a text stream

By default, the model returns a response after completing the entire text generation process. You can achieve faster interactions by not waiting for the entire result, and instead use streaming to handle partial results.

The following example shows how to implement streaming using the [`streamGenerateContent`](https://ai.google.dev/api/rest/v1/models/streamGenerateContent) method to generate text from a text-only input prompt.

```
import { GoogleGenerativeAI } from "@google/generative-ai";
const genAI = new GoogleGenerativeAI("GEMINI_API_KEY");
const model = genAI.getGenerativeModel({ model: "gemini-2.0-pro-exp-02-05" });

const prompt = "Explain how AI works";

const result = await model.generateContentStream(prompt);

for await (const chunk of result.stream) {
  const chunkText = chunk.text();
  process.stdout.write(chunkText);
}
```

## Create a chat conversation

The Gemini SDK lets you collect multiple rounds of questions and responses, allowing users to step incrementally toward answers or get help with multipart problems. This SDK feature provides an interface to keep track of conversations history, but behind the scenes uses the same `generateContent` method to create the response.

The following code example shows a basic chat implementation:

```
import { GoogleGenerativeAI } from "@google/generative-ai";
const genAI = new GoogleGenerativeAI("GEMINI_API_KEY");
const model = genAI.getGenerativeModel({ model: "gemini-2.0-pro-exp-02-05" });
const chat = model.startChat({
  history: [
    {
      role: "user",
      parts: [{ text: "Hello" }],
    },
    {
      role: "model",
      parts: [{ text: "Great to meet you. What would you like to know?" }],
    },
  ],
});

let result = await chat.sendMessage("I have 2 dogs in my house.");
console.log(result.response.text());
let result2 = await chat.sendMessage("How many paws are in my house?");
console.log(result2.response.text());
```

You can also use streaming with chat, as shown in the following example:

```
import { GoogleGenerativeAI } from "@google/generative-ai";
const genAI = new GoogleGenerativeAI("GEMINI_API_KEY");
const model = genAI.getGenerativeModel({ model: "gemini-2.0-pro-exp-02-05" });

const chat = model.startChat({
  history: [
    {
      role: "user",
      parts: [{ text: "Hello" }],
    },
    {
      role: "model",
      parts: [{ text: "Great to meet you. What would you like to know?" }],
    },
  ],
});

let result = await chat.sendMessageStream("I have 2 dogs in my house.");
for await (const chunk of result.stream) {
  const chunkText = chunk.text();
  process.stdout.write(chunkText);
}
let result2 = await chat.sendMessageStream("How many paws are in my house?");
for await (const chunk of result2.stream) {
  const chunkText = chunk.text();
  process.stdout.write(chunkText);
}
```

## Configure text generation

Every prompt you send to the model includes parameters that control how the model generates responses. You can use [`GenerationConfig`](https://ai.google.dev/api/rest/v1/GenerationConfig) to configure these parameters. If you don't configure the parameters, the model uses default options, which can vary by model.

The following example shows how to configure several of the available options.

```
import { GoogleGenerativeAI } from "@google/generative-ai";
const genAI = new GoogleGenerativeAI("GEMINI_API_KEY");

const model = genAI.getGenerativeModel({ model: "gemini-2.0-pro-exp-02-05" });

const result = await model.generateContent({
    contents: [
        {
          role: 'user',
          parts: [
            {
              text: "Explain how AI works",
            }
          ],
        }
    ],
    generationConfig: {
      maxOutputTokens: 1000,
      temperature: 0.1,
    }
});

console.log(result.response.text());
```

## Add system instructions

System instructions let you steer the behavior of a model based on your specific needs and use cases.

By giving the model system instructions, you provide the model additional context to understand the task, generate more customized responses, and adhere to specific guidelines over the full user interaction with the model. You can also specify product-level behavior by setting system instructions, separate from prompts provided by end users.

You can set system instructions when you initialize your model:

```
// Set the system instruction during model initialization
const model = genAI.getGenerativeModel({
  model: "gemini-2.0-pro-exp-02-05",
  systemInstruction: "You are a cat. Your name is Neko.",
});
```

Then, you can send requests to the model as usual.






# Long context

Gemini 2.0 Flash and Gemini 1.5 Flash come with a 1-million-token context window, and Gemini 1.5 Pro comes with a 2-million-token context window. Historically, large language models (LLMs) were significantly limited by the amount of text (or tokens) that could be passed to the model at one time. The Gemini 1.5 long context window, with [near-perfect retrieval (>99%)](https://storage.googleapis.com/deepmind-media/gemini/gemini_v1_5_report.pdf), unlocks many new use cases and developer paradigms.

The code you already use for cases like [text generation](https://ai.google.dev/gemini-api/docs/text-generation) or [multimodal inputs](https://ai.google.dev/gemini-api/docs/vision) will work out of the box with long context.

Throughout this guide, you briefly explore the basics of the context window, how developers should think about long context, various real world use cases for long context, and ways to optimize the usage of long context.

## What is a context window?

The basic way you use the Gemini models is by passing information (context) to the model, which will subsequently generate a response. An analogy for the context window is short term memory. There is a limited amount of information that can be stored in someone's short term memory, and the same is true for generative models.

You can read more about how models work under the hood in our [generative models guide](https://ai.google.dev/gemini-api/docs/models/generative-models).

## Getting started with long context

Most generative models created in the last few years were only capable of processing 8,000 tokens at a time. Newer models pushed this further by accepting 32,000 tokens or 128,000 tokens. Gemini 1.5 is the first model capable of accepting 1 million tokens, and now [2 million tokens with Gemini 1.5 Pro](https://developers.googleblog.com/en/new-features-for-the-gemini-api-and-google-ai-studio/).

In practice, 1 million tokens would look like:

- 50,000 lines of code (with the standard 80 characters per line)
- All the text messages you have sent in the last 5 years
- 8 average length English novels
- Transcripts of over 200 average length podcast episodes

Even though the models can take in more and more context, much of the conventional wisdom about using large language models assumes this inherent limitation on the model, which as of 2024, is no longer the case.

Some common strategies to handle the limitation of small context windows included:

- Arbitrarily dropping old messages / text from the context window as new text comes in
- Summarizing previous content and replacing it with the summary when the context window gets close to being full
- Using RAG with semantic search to move data out of the context window and into a vector database
- Using deterministic or generative filters to remove certain text / characters from prompts to save tokens

While many of these are still relevant in certain cases, the default place to start is now just putting all of the tokens into the context window. Because Gemini models were purpose-built with a long context window, they are much more capable of in-context learning. For example, with only instructional materials (a 500-page reference grammar, a dictionary, and ≈ 400 extra parallel sentences) all provided in context, Gemini 1.5 Pro and Gemini 1.5 Flash are [capable of learning to translate](https://storage.googleapis.com/deepmind-media/gemini/gemini_v1_5_report.pdf) from English to Kalamang— a Papuan language with fewer than 200 speakers and therefore almost no online presence—with quality similar to a person who learned from the same materials.

This example underscores how you can start to think about what is possible with long context and the in-context learning capabilities of Gemini models.

## Long context use cases

While the standard use case for most generative models is still text input, the Gemini 1.5 model family enables a new paradigm of multimodal use cases. These models can natively understand text, video, audio, and images. They are accompanied by the [Gemini API that takes in multimodal file types](https://ai.google.dev/gemini-api/docs/prompting_with_media) for convenience.

### Long form text

Text has proved to be the layer of intelligence underpinning much of the momentum around LLMs. As mentioned earlier, much of the practical limitation of LLMs was because of not having a large enough context window to do certain tasks. This led to the rapid adoption of retrieval augmented generation (RAG) and other techniques which dynamically provide the model with relevant contextual information. Now, with larger and larger context windows (currently up to 2 million on Gemini 1.5 Pro), there are new techniques becoming available which unlock new use cases.

Some emerging and standard use cases for text based long context include:

- Summarizing large corpuses of text
    - Previous summarization options with smaller context models would require a sliding window or another technique to keep state of previous sections as new tokens are passed to the model
- Question and answering
    - Historically this was only possible with RAG given the limited amount of context and models' factual recall being low
- Agentic workflows
    - Text is the underpinning of how agents keep state of what they have done and what they need to do; not having enough information about the world and the agent's goal is a limitation on the reliability of agents

[Many-shot in-context learning](https://arxiv.org/pdf/2404.11018) is one of the most unique capabilities unlocked by long context models. Research has shown that taking the common "single shot" or "multi-shot" example paradigm, where the model is presented with one or a few examples of a task, and scaling that up to hundreds, thousands, or even hundreds of thousands of examples, can lead to novel model capabilities. This many-shot approach has also been shown to perform similarly to models which were fine-tuned for a specific task. For use cases where a Gemini model's performance is not yet sufficient for a production rollout, you can try the many-shot approach. As you might explore later in the long context optimization section, context caching makes this type of high input token workload much more economically feasible and even lower latency in some cases.

### Long form video

Video content's utility has long been constrained by the lack of accessibility of the medium itself. It was hard to skim the content, transcripts often failed to capture the nuance of a video, and most tools don't process image, text, and audio together. With Gemini 1.5, the long-context text capabilities translate to the ability to reason and answer questions about multimodal inputs with sustained performance. Gemini 1.5 Flash, when tested on the needle in a video haystack problem with 1M tokens, obtained >99.8% recall of the video in the context window, and 1.5 Pro reached state of the art performance on the [Video-MME benchmark](https://video-mme.github.io/home_page.html).

Some emerging and standard use cases for video long context include:

- Video question and answering
- Video memory, as shown with [Google's Project Astra](https://deepmind.google/technologies/gemini/project-astra/)
- Video captioning
- Video recommendation systems, by enriching existing metadata with new multimodal understanding
- Video customization, by looking at a corpus of data and associated video metadata and then removing parts of videos that are not relevant to the viewer
- Video content moderation
- Real-time video processing

When working with videos, it is important to consider how the [videos are processed into tokens](https://ai.google.dev/gemini-api/docs/tokens#media-token), which affects billing and usage limits. You can learn more about prompting with video files in the [Prompting guide](https://ai.google.dev/gemini-api/docs/prompting_with_media?lang=python#prompting-with-videos).

### Long form audio

The Gemini 1.5 models were the first natively multimodal large language models that could understand audio. Historically, the typical developer workflow would involve stringing together multiple domain specific models, like a speech-to-text model and a text-to-text model, in order to process audio. This led to additional latency required by performing multiple round-trip requests and decreased performance usually attributed to disconnected architectures of the multiple model setup.

On standard audio-haystack evaluations, Gemini 1.5 Pro is able to find the hidden audio in 100% of the tests and Gemini 1.5 Flash is able to find it in 98.7% [of the tests](https://storage.googleapis.com/deepmind-media/gemini/gemini_v1_5_report.pdf). Gemini 1.5 Flash accepts up to 9.5 hours of [audio in a single request](https://ai.google.dev/gemini-api/docs/prompting_with_media?lang=python#audio_formats) and Gemini 1.5 Pro can accept up to 19 hours of audio using the 2-million-token context window. Further, on a test set of 15-minute audio clips, Gemini 1.5 Pro archives a word error rate (WER) of ~5.5%, much lower than even specialized speech-to-text models, without the added complexity of extra input segmentation and pre-processing.

Some emerging and standard use cases for audio context include:

- Real-time transcription and translation
- Podcast / video question and answering
- Meeting transcription and summarization
- Voice assistants

You can learn more about prompting with audio files in the [Prompting guide](https://ai.google.dev/gemini-api/docs/prompting_with_media?lang=python#prompting-with-videos).

## Long context optimizations

The primary optimization when working with long context and the Gemini 1.5 models is to use [context caching](https://ai.google.dev/gemini-api/docs/caching). Beyond the previous impossibility of processing lots of tokens in a single request, the other main constraint was the cost. If you have a "chat with your data" app where a user uploads 10 PDFs, a video, and some work documents, you would historically have to work with a more complex retrieval augmented generation (RAG) tool / framework in order to process these requests and pay a significant amount for tokens moved into the context window. Now, you can cache the files the user uploads and pay to store them on a per hour basis. The input / output cost per request with Gemini 1.5 Flash for example is ~4x less than the standard input / output cost, so if the user chats with their data enough, it becomes a huge cost saving for you as the developer.

## Long context limitations

In various sections of this guide, we talked about how Gemini 1.5 models achieve high performance across various needle-in-a-haystack retrieval evals. These tests consider the most basic setup, where you have a single needle you are looking for. In cases where you might have multiple "needles" or specific pieces of information you are looking for, the model does not perform with the same accuracy. Performance can vary to a wide degree depending on the context. This is important to consider as there is an inherent tradeoff between getting the right information retrieved and cost. You can get ~99% on a single query, but you have to pay the input token cost every time you send that query. So for 100 pieces of information to be retrieved, if you needed 99% performance, you would likely need to send 100 requests. This is a good example of where context caching can significantly reduce the cost associated with using Gemini models while keeping the performance high.






# Code execution

Python Node.js Go REST

The Gemini API code execution feature enables the model to generate and run Python code and learn iteratively from the results until it arrives at a final output. You can use this code execution capability to build applications that benefit from code-based reasoning and that produce text output. For example, you could use code execution in an application that solves equations or processes text.

Code execution is available in both AI Studio and the Gemini API. In AI Studio, you can enable code execution in the right panel under **Tools**. The Gemini API provides code execution as a tool, similar to [function calling](https://ai.google.dev/gemini-api/docs/function-calling/tutorial). After you add code execution as a tool, the model decides when to use it.

The code execution environment includes the following libraries: `altair`, `chess`, `cv2`, `matplotlib`, `mpmath`, `numpy`, `pandas`, `pdfminer`, `reportlab`, `seaborn`, `sklearn`, `statsmodels`, `striprtf`, `sympy`, and `tabulate`. You can't install your own libraries.

**Note:** Only `matplotlib` is supported for graph rendering using code execution.

## Get started with code execution

This section assumes that you've completed the setup and configuration steps shown in the [quickstart](https://ai.google.dev/gemini-api/docs/quickstart).

### Enable code execution on the model

You can enable code execution on the model, as shown here:

```
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const model = genAI.getGenerativeModel({
  model: 'gemini-1.5-pro',
  tools: [
    {
      codeExecution: {},
    },
  ],
});

const result = await model.generateContent(
  'What is the sum of the first 50 prime numbers? ' +
    'Generate and run code for the calculation, and make sure you get all 50.',
);

const response = result.response;
console.log(response.text());
```

The output might look something like this:

```python
def is_prime(n):
  """Checks if a number is prime."""
  if n <= 1:
    return False
  for i in range(2, int(n**0.5) + 1):
    if n % i == 0:
      return False
  return True

def sum_of_primes(n):
  """Calculates the sum of the first n prime numbers."""
  primes = []
  i = 2
  while len(primes) < n:
    if is_prime(i):
      primes.append(i)
    i += 1
  return sum(primes)

# Calculate the sum of the first 50 prime numbers
sum_of_first_50_primes = sum_of_primes(50)

print(f"The sum of the first 50 prime numbers is: {sum_of_first_50_primes}")
```

**Explanation:**

1. **`is_prime(n)` Function:**
   - Takes an integer `n` as input.
   - Returns `False` for numbers less than or equal to 1 (not prime).
   - Iterates from 2 up to the square root of `n`. If `n` is divisible by any
     number in this range, it's not prime, and we return `False`.
   - If the loop completes without finding a divisor, the number is prime, and
     we return `True`.

2. **`sum_of_primes(n)` Function:**
   - Takes an integer `n` (number of primes desired) as input.
   - Initializes an empty list `primes` to store the prime numbers.
   - Starts a loop, iterating through numbers starting from 2.
   - For each number `i`, it checks if it's prime using the `is_prime()` function.
   - If `i` is prime, it's appended to the `primes` list.
   - The loop continues until the `primes` list has `n` prime numbers.
   - Finally, it calculates and returns the sum of all the prime numbers in the
     `primes` list.

3. **Main Part:**
   - Calls `sum_of_primes(50)` to get the sum of the first 50 prime numbers.
   - Prints the result.

**Output:**

```
The sum of the first 50 prime numbers is: 5117
```

### Enable code execution on the request

Alternatively, you can enable code execution on the call to `generateContent` or `generateContentStream`:

```
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const model = genAI.getGenerativeModel({
  model: 'gemini-1.5-pro',
});

const result = await model.generateContent({
  contents: [
    {
      role: 'user',
      parts: [
        {
          text:
            'What is the sum of the first 50 prime numbers? ' +
            'Generate and run code for the calculation, ' +
            'and make sure you get all 50.',
        },
      ],
    },
  ],
  // Setting it on the generateContentStream request.
  tools: [
    {
      codeExecution: {},
    },
  ],
});

const response = result.response;
console.log(response.text());
```

### Use code execution in chat

You can also use code execution as part of a chat.

```
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const model = genAI.getGenerativeModel({
  model: 'gemini-1.5-pro',
});

const chat = model.startChat({
  // This could also be set on the model.
  tools: [
    {
      codeExecution: {},
    },
  ],
});

const result = await chat.sendMessage(
  'What is the sum of the first 50 prime numbers? ' +
    'Generate and run code for the calculation, and make sure you get all 50.',
);
const response = result.response;
console.log(response.text());
```

## Input/output (I/O)

Starting with [Gemini 2.0 Flash](https://ai.google.dev/gemini-api/docs/models/gemini#gemini-2.0-flash), code execution supports file input and graph output. Using these new input and output capabilities, you can upload CSV and text files, ask questions about the files, and have [Matplotlib](https://matplotlib.org/) graphs generated as part of the response.

### I/O pricing

When using code execution I/O, you're charged for input tokens and output tokens:

**Input tokens:**

- User prompt

**Output tokens:**

- Code generated by the model
- Code execution output in the code environment
- Summary generated by the model

### I/O details

When you're working with code execution I/O, be aware of the following technical details:

- The maximum runtime of the code environment is 30 seconds.
- If the code environment generates an error, the model may decide to regenerate the code output. This can happen up to 5 times.
- The maximum file input size is limited by the model token window. In AI Studio, using Gemini Flash 2.0, the maximum input file size is 1 million tokens (roughly 2MB for text files of the supported input types). If you upload a file that's too large, AI Studio won't let you send it.

||Single turn|Bidirectional (Multimodal Live API)|
|---|---|---|
|Models supported|All Gemini 2.0 models|Only Flash experimental models|
|File input types supported|.png, .jpeg, .csv, .xml, .cpp, .java, .py, .js, .ts|.png, .jpeg, .csv, .xml, .cpp, .java, .py, .js, .ts|
|Plotting libraries supported|Matplotlib|Matplotlib|
|[Multi-tool use](https://ai.google.dev/gemini-api/docs/function-calling#multi-tool-use)|No|Yes|

## Billing

There's no additional charge for enabling code execution from the Gemini API. You'll be billed at the current rate of input and output tokens based on the Gemini model you're using.

Here are a few other things to know about billing for code execution:

- You're only billed once for the input tokens you pass to the model, and you're billed for the final output tokens returned to you by the model.
- Tokens representing generated code are counted as output tokens. Generated code can include text and multimodal output like images.
- Code execution results are also counted as output tokens.

The billing model is shown in the following diagram:

![code execution billing model](https://ai.google.dev/static/gemini-api/docs/images/code-execution-diagram.png)

- You're billed at the current rate of input and output tokens based on the Gemini model you're using.
- If Gemini uses code execution when generating your response, the original prompt, the generated code, and the result of the executed code are labeled _intermediate tokens_ and are billed as _input tokens_.
- Gemini then generates a summary and returns the generated code, the result of the executed code, and the final summary. These are billed as _output tokens_.
- The Gemini API includes an intermediate token count in the API response, so you know why you're getting additional input tokens beyond your initial prompt.

## Limitations

- The model can only generate and execute code. It can't return other artifacts like media files.
- In some cases, enabling code execution can lead to regressions in other areas of model output (for example, writing a story).
- There is some variation in the ability of the different models to use code execution successfully.





# Gemini 2.0  Thinking

The Gemini 2.0  Thinking model is an experimental model that's trained to generate the "thinking process" the model goes through as part of its response. As a result, the Thinking model is capable of stronger reasoning capabilities in its responses than the Gemini 2.0 Flash Experimental model.

`gemini-2.0-flash-thinking-exp-01-21`

## Use thinking models

Flash Thinking models are available in [Google AI Studio](https://aistudio.google.com/prompts/new_chat?model=gemini-2.0-flash-thinking-exp-01-21) and through the Gemini API. The Gemini API doesn't return thoughts in the response.

**Note:** We have set up gemini-2.0-flash-thinking-exp-01-21  as an alias to the latest Flash Thinking model. Use this alias to get the latest thinking model, or specify the full model name.

### Send a basic request

[Python](https://ai.google.dev/gemini-api/docs/thinking#python)

This example uses the new [Google Genai SDK](https://ai.google.dev/gemini-api/docs/sdks#python-quickstart) and the `v1alpha` version of the API.

```
from google import genai

client = genai.Client(api_key='GEMINI_API_KEY', http_options={'api_version':'v1alpha'})

response = client.models.generate_content(
    model='gemini-2.0-flash-thinking-exp',
    contents='Explain how RLHF works in simple terms.',
)

print(response.text)
```

### Multi-turn thinking conversations

During multi-turn conversations, you pass the entire conversation history as input, so the model has access to its previous thoughts in a multi-turn conversation.

[Python](https://ai.google.dev/gemini-api/docs/thinking#python)

The new [Google Genai SDK](https://ai.google.dev/gemini-api/docs/sdks#python-quickstart) provides the ability to create a multi-turn chat session which is helpful to manage the state of a conversation.

```
from google import genai

client = genai.Client(api_key='GEMINI_API_KEY', http_options={'api_version':'v1alpha'})

chat = client.aio.chats.create(
    model='gemini-2.0-flash-thinking-exp-01-21',
)
response = await chat.send_message('What is your name?')
print(response.text)
response = await chat.send_message('What did you just say before this?')
print(response.text)
```

## Limitations

The Thinking model is an experimental model and has the following limitations:

- No JSON mode or Search Grounding
- Thoughts are only shown in Google AI Studio



Here's a breakdown of why genai is a great choice, how it compares to Vertex AI, and how to get started:

google.generativeai vs. Vertex AI SDK:

Feature	google.generativeai (genai)	Vertex AI SDK (vertexai.generative_models)
Primary Use Case	Direct interaction with Gemini models, prototyping, simpler applications, learning the Gemini API.	Integration with the broader Vertex AI platform (training, deployment, MLOps), production-level applications, fine-tuning (for supported models), access to other Vertex AI services.
Complexity	Simpler API, easier to get started.	More comprehensive, but also more complex. Requires understanding of Vertex AI concepts.
Dependencies	Fewer dependencies. Easier to install and manage.	More dependencies, including the full Vertex AI SDK.
Cloud Project Required	No, you can use it with just an API key, which is very convenient. You can also use it with a Google Cloud project, but it's optional.	Yes, requires a Google Cloud project and proper authentication setup (service account, etc.).
Fine-tuning	Currently, fine-tuning is done through the Vertex AI SDK or the Google AI Studio UI.	Fine-tuning is supported (for models that allow it).
Cost	The cost is based on Gemini API usage, the same as Vertex AI. The library itself doesn't add extra cost.	The cost is also based on Gemini API usage (and any other Vertex AI services you use). The SDK itself doesn't add cost, but Vertex AI services often have their own pricing.
Recommended For	Most users starting with Gemini, prototyping, educational purposes, applications that don't need Vertex AI's platform features.	Production deployments, applications requiring tight integration with other Google Cloud services, users already familiar with Vertex AI.
In short: For most of the use cases we've been discussing, google.generativeai is likely the better choice. It's designed for ease of use and direct interaction with the Gemini API.

Getting Started with google.generativeai:

Install:

pip install google-generativeai
Use code with caution.
Bash
Get an API Key:

Go to Google AI Studio.

Create a new API key. Keep this key secret!

Basic Example:

import google.generativeai as genai

# Configure the API key
genai.configure(api_key="YOUR_API_KEY")

# Choose a model
model = genai.GenerativeModel('gemini-pro')  # Or 'gemini-1.5-pro', etc.

# Generate content
response = model.generate_content("What is the meaning of life?")

print(response.text)
# print(response.prompt_feedback) # check for safety issues.
# print(response.candidates)
Use code with caution.
Python
Toggling Features with google.generativeai:

The concepts for controlling features (temperature, tools, etc.) are very similar to the Vertex AI SDK, but the specific parameter names and object structures might be slightly different. Here's how it translates:

import google.generativeai as genai

genai.configure(api_key="YOUR_API_KEY")

# --- 1. Temperature ---

# Control:  `generation_config` (same as Vertex AI)
model = genai.GenerativeModel('gemini-pro')
response = model.generate_content(
    "Write a short poem.",
    generation_config=genai.GenerationConfig(
        temperature=0.9  # High temperature
    )
)
print("High Temp:", response.text)

response = model.generate_content(
    "Write a short poem.",
    generation_config=genai.GenerationConfig(
        temperature=0.1  # Low temperature
    )
)
print("Low Temp:", response.text)
# --- 2. Tools (Function Calling) ---

# Control: `tools` parameter (same concept, slightly different structure)

# Function Declaration (using a dictionary)
get_current_weather = {
    "name": "get_current_weather",
    "description": "Get the current weather in a given location",
    "parameters": {
        "type": "object",
        "properties": {
            "location": {
                "type": "string",
                "description": "The city and state, e.g. San Francisco, CA",
            }
        },
        "required": ["location"],
    },
}

# Tool Definition
weather_tool = {"function_declarations": [get_current_weather]}

# Enable Tools
response_with_tools = model.generate_content(
    "What's the weather like in Seattle?", tools=[weather_tool]
)

# Check if a function call was made:
if response_with_tools.candidates:
  if response_with_tools.candidates[0].content.parts:
      part = response_with_tools.candidates[0].content.parts[0]
      if part.function_call:
        print("Function Call:", part.function_call)
      else:
          print("Text:", part.text)
else:
    print("No candidates in response")
# Disable Tools: Omit the `tools` parameter

# --- 3. Code Execution ---
#   Same as with Vertex AI: Gemini does *not* execute code directly within the API.
#   You would need to handle external execution.

# --- 4. Function Calling ---

#   Same as "Tools" (#2).

# --- 5. Grounding with Search ---

#   * RAG:  You implement this yourself (using Qdrant, as before).
#   * Built-in Google Search Grounding:
#     - *Check the documentation* for your specific model to see if it's supported.
#      -Likely enabled by setting an option within `generation_config`. the exact parameter will vary, and may be something like `grounding_config`.
# Example: check safety settings and citations.
response = model.generate_content("What is the population of France?")
print(response.text)
print(response.prompt_feedback)
if response.prompt_feedback:
    for citation_metadata in response.prompt_feedback.citation_metadata:
        print(citation_metadata)

# --- Combining Everything ---


generation_config = genai.GenerationConfig(
    temperature=0.1,
    # grounding_config=...,  # Check docs for grounding options!
)

response_combined = model.generate_content(
    "Write a story about a talking cat.",
    tools=[weather_tool],
    generation_config=generation_config,
    safety_settings = safety_settings
)

print(response_combined.text)

#Multi-turn conversations.
chat = model.start_chat()
response1 = chat.send_message("what is 1 + 1?", generation_config = generation_config)
response2 = chat.send_message("what is 2 + 2?", generation_config = generation_config) #not needed, configs persist.
print(response1.text, response2.text)
Use code with caution.
Python
Key Differences in google.generativeai:

Function Declarations: Instead of separate FunctionDeclaration and Tool classes, you define functions using dictionaries within a list, inside a dictionary assigned to the function_declarations key.

prompt_feedback: Use response.prompt_feedback to access safety-related information and (potentially) citation metadata. This is how you'd check if the response was blocked due to safety settings.

candidates: The response.text attribute directly gives you the text of the first candidate. If you have multiple candidates (controlled by candidate_count in GenerationConfig), you'd access them through response.candidates.

Checking for function calls: the example code shows how to check for and get the details of function calls.

In summary, the google.generativeai library provides a streamlined way to interact with the Gemini API. The core concepts for controlling model behavior are the same as the Vertex AI SDK, but with a slightly simplified API. For most users, genai is the recommended starting point. Remember to always check the official documentation for the most up-to-date information and model-specific details.