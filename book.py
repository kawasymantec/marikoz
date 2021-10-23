import requests
import time
import json
from PIL import ImageFont, ImageDraw, Image

OPENBD_URL      = "https://api.openbd.jp/v1/get"                                        # OpenBD接続URL

RAKUTEN_URL     = "https://app.rakuten.co.jp/services/api/BooksBook/Search/20170404"    # 楽天ブックスAPI接続URL
RAKUTEN_APP_ID  = "1019073917048612338"                                                 # 楽天ブックスAPIアプリケーションID
SORT            = "-releaseDate"                                                        # 楽天ブックスAPIソートキー（新しい順）
GENRE           = ["001019001",                                                         # 楽天ブックスAPI取得ジャンル（文庫配下のジャンル）
                   "001019002", 
                   "001019003", 
                   "001019005", 
                   "001019006", 
                   "001019007", 
                   "001019008", 
                   "001019009", 
                   "001019010", 
                   "001019011", 
                   "001019012", 
                   "001019013", 
                   "001019014", 
                   "001019015"]

output_json = []    # ファイル出力JSON格納用

# 楽天ブックスAPIからISBNコードを取得
def getIsbn():
    isbn = []   # ISBNコード格納用

    # ジャンル毎の総ページ数を取得
    for genre in GENRE:
        response = requests.get("{}?applicationId={}&sort={}&booksGenreId={}".format(RAKUTEN_URL, RAKUTEN_APP_ID, SORT, genre))

        if response.status_code != requests.codes.ok:
            print("Requests failed")
        else:
            print("")
            print("------------------------------------------------------")
            print("ジャンルID：{}".format(genre))
            print("総冊数：{}".format(response.json()["count"]))
            print("総ページ数：{}".format(response.json()["pageCount"]))
            print("------------------------------------------------------")

            # 各ページから本情報を取得
            for page in range(1, response.json()["pageCount"] + 1):
                response = requests.get("{}?applicationId={}&sort={}&booksGenreId={}&page={}".format(RAKUTEN_URL, RAKUTEN_APP_ID, SORT, genre, page))

                if response.status_code != requests.codes.ok:
                    print("Requests failed")
                else:
                    print("ページ数：{}/{}".format(page, response.json()["pageCount"]))

                    # 1ページの最大取得件数（30件）のISBNコードを格納
                    for count in range(response.json()["hits"]):
                        isbn.append(response.json()["Items"][count]["Item"]["isbn"])
                
                # １秒間スリープ
                time.sleep(1)

        # １秒間スリープ
        time.sleep(1)

    # ISBNコードの重複を削除
    isbn = list(set(isbn))

    print("")
    print("ISBN件数：{}".format(len(isbn)))

    getBookInfo(isbn)

# OpenBDから本情報を取得
# isbn : 楽天ブックスAPIで取得したISBNコード配列
def getBookInfo(isbn):
    param = ""  # OpenBDリクエストパラメータ（ISBNコード）用

    # ISBNコードのカンマ区切り文字列を作成
    for count in range(len(isbn)):
        if param == "":
            param = isbn[count]
        else:
            param += "," + isbn[count]

            # 1000件単位で本情報を取得（OpenBDの制限）
            if count % 999 == 0:
                response = requests.get("{}?isbn={}".format(OPENBD_URL, param))

                if response.status_code != requests.codes.ok:
                        print("Requests failed")
                else:
                    setJsonData(response.json(), False)
                    param = ""

    # 1000件単位の余りの本情報を取得
    response = requests.get("{}?isbn={}".format(OPENBD_URL, param))

    if response.status_code != requests.codes.ok:
            print("Requests failed")
    else:
        setJsonData(response.json(), True)

# 必要な情報でJSON配列を作成
# res        : OpenBDから返却されたJSON
# output_flg : ファイル出力フラグ（最後のリクエスト実行後のみTrue）
def setJsonData(res, output_flg):
    for num in range(len(res)):

        # ISBNコードが見つからなければスキップ
        if res[num] is None:
            pass
        else:

            # ISBNコード
            try:
                isbn = res[num]["onix"]["RecordReference"]
            except:
                isbn = ""

            # タイトル
            try:
                title = res[num]["onix"]["DescriptiveDetail"]["TitleDetail"]["TitleElement"]["TitleText"]["content"]
            except:
                title = ""

            # タイトルの読み仮名
            try:
                title_collation_key = res[num]["onix"]["DescriptiveDetail"]["TitleDetail"]["TitleElement"]["TitleText"]["collationkey"]
            except:
                title_collation_key = ""

            # 作者
            try:
                contributor = res[num]["onix"]["DescriptiveDetail"]["Contributor"][0]["PersonName"]["content"]
            except:
                contributor = ""

            # 作者の読み仮名
            try:
                contributor_collation_key = res[num]["onix"]["DescriptiveDetail"]["Contributor"][0]["PersonName"]["collationkey"]
            except:
                contributor_collation_key = ""
            
            # 出版社
            try:
                imprint = res[num]["onix"]["PublishingDetail"]["Imprint"]["ImprintName"]
            except:
                imprint = ""

            # ページ数
            try:
                page = res[num]["onix"]["DescriptiveDetail"]["Extent"][0]["ExtentValue"]
            except:
                page = ""

            # 表紙画像のURL
            try:
                main_cover = res[num]["onix"]["CollateralDetail"]["SupportingResource"][0]["ResourceVersion"][0]["ResourceLink"]
            except :
                main_cover = ""

            # 背表紙画像のURL
            back_cover = "back_cover_img/" + isbn + ".png"

            obj = {
                "isbn":isbn,
                "title":title,
                "title_collation_key":title_collation_key,
                "contributor":contributor,
                "contributor_collation_key":contributor_collation_key,
                "imprint":imprint,
                "page":page,
                "main_cover":main_cover,
                "back_cover":back_cover
            }
            output_json.append(obj)
            outputBackCoverImage(title, contributor, isbn)

    if output_flg == True:
        outputJson(output_json)

# JSONファイルを出力
# json_data : OpenBDのレスポンスから作成したJSON配列
def outputJson(json_data):

    # JSONファイルを作成（作成済みの場合は上書き）
    file = open("json/book.json", "w")
    json.dump(json_data, file, indent=4, ensure_ascii=False)
    file.close()

    print("出力完了")

# 元画像に文字を縦書きで描画
# frame_image   : Imageオブジェクト
# font_size     : フォントサイズ
# target_string : 描画する文字列
# draw_start_x  : 描画開始位置（X）
# draw_start_y  : 描画開始位置（Y）
# font_color    : 文字色
def draw_text(frame_image, font_size, target_string, draw_start_x, draw_start_y, font_color):

    # 元画像を取得
    draw = ImageDraw.Draw(frame_image)

    # フォントデータを取得
    image_font = ImageFont.truetype("font/back_cover_font.otf", font_size)

    # 各文字の描画管理変数
    ix, iy = 0, 0

    for c in target_string:
        x = draw_start_x - ix * font_size
        y = draw_start_y + (iy * font_size)

        # 描画する1文字のX, Yを設定
        char_width, char_height = image_font.getsize(c)
        x += (font_size - char_width) / 2
        y += draw_start_y

        # 指定の場所へ文字を描画
        draw.text((x, y), c, font=image_font, fill=font_color)

        # 次の文字へ
        iy += 1

    return True

def outputBackCoverImage(title, contributor, isbn):
    # 元画像データを取得
    image_data = Image.open("img/back_cover_base.png")

    if len(contributor) < 7:
        font_size          = 12
        draw_start_x       = 22
        draw_start_y       = 7
    elif len(contributor) >= 7 and len(contributor) < 10:
        font_size          = 10
        draw_start_x       = 23
        draw_start_y       = 7
    elif len(contributor) >= 10:
        # 2行に分割して表示（1行目）
        font_size          = 10
        draw_start_x       = 30
        draw_start_y       = 7
        contributor_1 = contributor[0:5]
        draw_text(image_data, font_size, contributor_1, draw_start_x, draw_start_y, "#000")

        # 2行に分割して表示（2行目）
        font_size          = 10
        draw_start_x       = 18
        draw_start_y       = 7
        contributor_2 = contributor[5:len(contributor)]
        draw_text(image_data, font_size, contributor_2, draw_start_x, draw_start_y, "#000")

        contributor = ""

    # 作者を描画
    draw_text(image_data, font_size, contributor, draw_start_x, draw_start_y, "#000")

    if len(title) < 19:
        font_size          = 18
        draw_start_x       = 19
        draw_start_y       = 55
    elif len(title) >= 19 and len(title) < 20:
        font_size          = 15
        draw_start_x       = 20
        draw_start_y       = 55
    else:
        # 2行に分割して表示（1行目）
        font_size          = 15
        draw_start_x       = 30
        draw_start_y       = 55
        title_1 = title[0:19]
        draw_text(image_data, font_size, title_1, draw_start_x, draw_start_y, "#000")

        # 2行に分割して表示（2行目）
        font_size          = 15
        draw_start_x       = 11
        draw_start_y       = 55
        title_2 = title[19:len(title)]
        draw_text(image_data, font_size, title_2, draw_start_x, draw_start_y, "#000")

        title = ""

    # タイトルを描画
    draw_text(image_data, font_size, title, draw_start_x, draw_start_y, "#000")

    # 合成した画像の書き出し
    image_data.save("back_cover_img/" + isbn + ".png")

# メインクラス
def main():
    getIsbn()

if __name__ == '__main__':
    main()