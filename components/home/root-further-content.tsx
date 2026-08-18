// R3 Root Further content (Frame 486 / mms_B4_content) — static long-form copy, verbatim
// from the rendered frame (copy authority per clarifications.md). Small ROOT/FURTHER
// watermark logo repeats above the body text at a smaller scale than the hero title.
// mm:3204:10155
// mm:3204:10154

import Image from 'next/image';

const PARAGRAPH_ONE = `Đứng trước bối cảnh thay đổi như vũ bão của thời đại AI và yêu cầu ngày càng cao từ khách hàng, Sun* lựa chọn chiến lược đa dạng hóa năng lực để không chỉ nỗ lực trở thành tinh anh trong lĩnh vực của mình, mà còn hướng đến một cái đích cao hơn, nơi mọi Sunner đều là "problem-solver" - chuyên gia trong việc giải quyết mọi vấn đề, tìm lời giải cho mọi bài toán của dự án, khách hàng và xã hội.
Lấy cảm hứng từ sự đa dạng năng lực, khả năng phát triển linh hoạt cùng tinh thần đào sâu để bứt phá trong kỷ nguyên AI, "Root Further" đã được chọn để trở thành chủ đề chính thức của Lễ trao giải Sun* Annual Awards 2025.
Vượt ra khỏi nét nghĩa bề mặt, "Root Further" chính là hành trình chúng ta không ngừng vươn xa hơn, cắm rễ mạnh hơn, chạm đến những tầng "địa chất" ẩn sâu để tiếp tục tồn tại, vươn lên và nuôi dưỡng đam mê kiến tạo giá trị luôn cháy bỏng của người Sun*. Mượn hình ảnh bộ rễ liên tục đâm sâu vào lòng đất, mạnh mẽ len lỏi qua từng lớp "trầm tích" để thẩm thấu những gì tinh tuý nhất, người Sun* cũng đang "hấp thụ" dưỡng chất từ thời đại và những thử thách của thị trường để làm mới mình mỗi ngày, mở rộng năng lực và mạnh mẽ "bén rễ" vào kỷ nguyên AI - một tầng "địa chất" hoàn toàn mới, phức tạp và khó đoán, nhưng cũng hội tụ vô vàn tiềm năng cùng cơ hội.`;

const PARAGRAPH_TWO = `Trước giông bão, chỉ những tán cây có bộ rễ đủ mạnh mới có thể trụ vững. Một tổ chức với những cá nhân tự tin vào năng lực đa dạng, sẵn sàng kiến tạo và đón nhận thử thách, làm chủ sự thay đổi là tổ chức không chỉ vững vàng trước biến động, mà còn khai thác được mọi lợi thế, chinh phục các thách thức của thời cuộc. Không đơn thuần là tên gọi của chương mới trên hành trình phát triển tổ chức, "Root Further" còn như một lời cổ vũ, động viên mỗi chúng ta hãy dám tin vào bản thân, dám đào sâu, khai mở mọi tiềm năng, dám phá bỏ giới hạn, dám trở thành phiên bản đa nhiệm và xuất sắc nhất của mình. Bởi trong thời đại AI, đa dạng năng lực và tận dụng sức mạnh thời cuộc chính là điều kiện tiên quyết để trường tồn.
Không ai biết trước ẩn sâu trong "lòng đất" của ngành công nghệ và thị trường hiện đại còn biết bao tầng "địa chất" bí ẩn. Chỉ biết rằng khi "Root Further" đã trở thành tinh thần cội rễ, chúng ta sẽ không sợ hãi, mà càng thấy háo hức trước bất cứ vùng vô định nào trên hành trình tiến về phía trước. Vì ta luôn tin rằng, trong chính những miền vô tận đó, là bao điều kỳ diệu và cơ hội vươn mình đang chờ ta.`;

export function RootFurtherContent() {
  return (
    <section className="mx-auto flex w-full max-w-[1152px] flex-col items-center gap-8 px-6 py-20 sm:px-10 lg:px-0">
      <div className="relative h-[67px] w-[145px] sm:h-[100px] sm:w-[217px] lg:h-[134px] lg:w-[290px]">
        <Image
          src="/saa/Root_Text.png"
          alt=""
          aria-hidden="true"
          width={189}
          height={67}
          className="absolute left-[18%] top-0 h-1/2 w-[65%] object-contain object-left-top"
        />
        <Image
          src="/saa/Further_Text.png"
          alt=""
          aria-hidden="true"
          width={290}
          height={67}
          className="absolute left-0 top-1/2 h-1/2 w-full object-contain object-left-top"
        />
      </div>
      <div className="flex flex-col gap-8 text-justify text-lg font-bold leading-8 text-white sm:text-2xl">
        {PARAGRAPH_ONE.split('\n').map((paragraph) => (
          <p key={paragraph.slice(0, 24)}>{paragraph}</p>
        ))}
      </div>
      <blockquote className="max-w-3xl text-center text-xl font-bold leading-8 text-white">
        <p>&ldquo;A tree with deep roots fears no storm&rdquo;</p>
        <p>(Cây sâu bén rễ, bão giông chẳng nề - Ngạn ngữ Anh)</p>
      </blockquote>
      <div className="flex flex-col gap-8 text-justify text-lg font-bold leading-8 text-white sm:text-2xl">
        {PARAGRAPH_TWO.split('\n').map((paragraph) => (
          <p key={paragraph.slice(0, 24)}>{paragraph}</p>
        ))}
      </div>
    </section>
  );
}
