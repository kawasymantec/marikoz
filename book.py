from typing import Match
import requests
import time
import json
import os
import math
from PIL import ImageFont, ImageDraw, Image

OPENBD_URL       = "https://api.openbd.jp/v1/get"                                        # OpenBD接続URL

RAKUTEN_URL      = "https://app.rakuten.co.jp/services/api/BooksBook/Search/20170404"    # 楽天ブックスAPI接続URL
RAKUTEN_APP_ID   = "1019073917048612338"                                                 # 楽天ブックスAPIアプリケーションID
SORT             = "-releaseDate"                                                        # 楽天ブックスAPIソートキー（新しい順）

output_json       = []   # ファイル出力JSON格納用
file_path_tmp     = 0    # 背表紙画像ファイル名生成用
low_file_path_tmp = 0    # 背表紙画像ファイル名生成用(小サイズ)
back_cover_count  = 0    # 背表紙画像作成数カウント用

# 楽天ブックスAPIからISBNコードを取得
def getBookInfo():
    global output_json
    json_count     = 0    # JSONファイル作成数カウント用
    books          = []   # 本情報格納用リスト
    book_tmp       = []   # 本情報格納用リスト

    # ジャンルJSONを読み込み
    genre_json = json.load(open("json/genre.json", "r"))
    
    # ジャンル毎の総ページ数を取得
    for genre in genre_json:
        shelf_count          = 0         # 本棚数カウント用
        cover_count          = 1         # 背表紙画像カウント用
        list_count           = 0         # 本情報リストカウント用
        cover_count_flg      = False     # 背表紙画像カウント加算フラグ
        back_cover_image     = []        # 背表紙画像ファイル名リスト
        back_cover_low_image = []        # 背表紙画像ファイル名リスト

        response = requests.get("{}?applicationId={}&sort={}&booksGenreId={}".format(RAKUTEN_URL, RAKUTEN_APP_ID, SORT, genre["id"]))

        if response.status_code != requests.codes.ok:
            print("Requests failed")
        else:
            print("")
            print("------------------------------------------------------")
            print("ジャンルID：{}".format(genre["id"]))
            print("総冊数：{}".format(response.json()["count"]))
            print("総ページ数：{}".format(response.json()["pageCount"]))
            print("------------------------------------------------------")

            # 背表紙画像ファイル名リストに1枚目の画像ファイル名を追加
            back_cover_image.append("back_cover_img/" + str(json_count+1).zfill(4) + "_1.png")
            back_cover_low_image.append("back_cover_low_img/" + str(json_count+1).zfill(4) + "_1_low.png")

            # 各ページから本情報を取得
            for page in range(1, response.json()["pageCount"] + 1):
                response = requests.get("{}?applicationId={}&sort={}&booksGenreId={}&page={}".format(RAKUTEN_URL, RAKUTEN_APP_ID, SORT, genre["id"], page))

                if response.status_code != requests.codes.ok:
                    print("Requests failed")
                else:
                    print("ページ数：{}/{}".format(page, response.json()["pageCount"]))

                    # 1ページの最大取得件数（30件）の本情報を格納
                    for count in range(response.json()["hits"]):

                        # ISBNコード
                        try:
                            isbn = response.json()["Items"][count]["Item"]["isbn"]
                        except:
                            isbn = ""

                        # タイトル
                        try:
                            title = response.json()["Items"][count]["Item"]["title"]
                        except:
                            title = ""

                        # タイトルの読み仮名
                        try:
                            title_collation_key = response.json()["Items"][count]["Item"]["titleKana"]
                        except:
                            title_collation_key = ""

                        # 作者
                        try:
                            contributor = response.json()["Items"][count]["Item"]["author"]
                        except:
                            contributor = ""

                        # 作者の読み仮名
                        try:
                            contributor_collation_key = response.json()["Items"][count]["Item"]["authorKana"]
                        except:
                            contributor_collation_key = ""
                        
                        # 出版社
                        try:
                            imprint = response.json()["Items"][count]["Item"]["publisherName"]
                        except:
                            imprint = ""

                        # 表紙画像のURL
                        response_openbd = requests.get("{}?isbn={}".format(OPENBD_URL, isbn))
                        if response_openbd.status_code != requests.codes.ok:
                                print("Requests failed")
                        else:
                            res = response_openbd.json()
                            # ISBNコードが見つからなければスキップ
                            if res[0] is None:
                                main_cover = ""
                            else:
                                # 表紙画像のURL
                                try:
                                    main_cover = res[0]["onix"]["CollateralDetail"]["SupportingResource"][0]["ResourceVersion"][0]["ResourceLink"]
                                except :
                                    main_cover = ""

                        # 販売ページ
                        try:
                            item_url = response.json()["Items"][count]["Item"]["itemUrl"]
                        except:
                            item_url = ""
                        
                        # 背表紙画像に表示するタイトル、作者が3行を超えないもののみリストに追加
                        if len(title) <= 32 and len(contributor) <= 12:

                            books_obj = {
                                "isbn"                      :isbn,
                                "title"                     :title,
                                "title_collation_key"       :title_collation_key,
                                "contributor"               :contributor,
                                "contributor_collation_key" :contributor_collation_key,
                                "imprint"                   :imprint,
                                "main_cover"                :main_cover,
                                "item_url"                  :item_url
                            }

                            books.append(books_obj)
                            book_tmp.append(books_obj)

                            # 44冊を超えた場合、次の背表紙画像ファイル名をリストに追加
                            if cover_count_flg == True:
                                list_count       = 0
                                cover_count     += 1
                                cover_count_flg  = False
                                back_cover_image.append("back_cover_img/" + str(json_count+1).zfill(4) + "_" + str(cover_count) + ".png")
                                back_cover_low_image.append("back_cover_low_img/" + str(json_count+1).zfill(4) + "_" + str(cover_count) + "_low.png")

                            list_count += 1

                            if list_count % 44 == 0:
                                cover_count_flg = True
                                # 背表紙画像を作成
                                outputBackCoverImage(book_tmp, str(json_count+1).zfill(4), str(cover_count))
                                outputBackCoverLowImage(book_tmp, str(json_count+1).zfill(4), str(cover_count))

                                book_tmp = list()

                        # 176冊でJSONファイルを出力
                        if len(books) == 176:
                            if shelf_count < genre["shelf_count"]:
                                cover_count      = 1
                                list_count       = 0
                                json_count      += 1
                                shelf_count     += 1
                                cover_count_flg  = False

                                # ジャンル情報をJSONに格納
                                obj = {
                                    "shelf_title"           :genre["genre"] + "/" + genre["sub_genre"],
                                    "category"              :genre["sub_genre"],
                                    "back_cover_images"     :back_cover_image,
                                    "back_cover_low_images" :back_cover_low_image,
                                    "books"                 :books
                                }

                                output_json.append(obj)
                                shelf_num = str(json_count).zfill(4)

                                outputJson(obj, shelf_num)

                                # リストを初期化
                                output_json          = list()
                                books                = list()
                                back_cover_image     = list()
                                back_cover_low_image = list()
                                book_tmp             = list()

                                # 背表紙画像ファイル名リストに1枚目の画像ファイル名を追加
                                back_cover_image.append("back_cover_img/" + str(json_count+1).zfill(4) + "_1.png")
                                back_cover_low_image.append("back_cover_low_img/" + str(json_count+1).zfill(4) + "_1_low.png")

                                if shelf_count == genre["shelf_count"]:
                                    break

                    if shelf_count == genre["shelf_count"]:
                        break
                
                # １秒間スリープ
                time.sleep(1)

        # １秒間スリープ
        time.sleep(1)
        
# JSONファイルを出力
# json_data : OpenBDのレスポンスから作成したJSON配列
# num       : 本棚番号
def outputJson(json_data, num):

    # JSONファイルを作成（作成済みの場合は上書き）
    file = open("json/" + num + ".json", "w")
    json.dump(json_data, file, indent=4, ensure_ascii=False)
    file.close()

    print("出力完了")

# 背表紙文字の描画処理
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

# ベース画像に背表紙を描画しファイルを出力
# title       : タイトル
# contributor : 作者
# shelf_num   : 本棚番号
# cover_num   : 背表紙画像番号
# list_count  : 本情報リストのインデックス
def outputBackCoverImage(books, shelf_num, cover_num):
    global file_path_tmp
    count = 0

    # ジャンル名フォルダが存在しなければ作成
    path = "back_cover_img/"
    if not os.path.exists(path):
        os.mkdir(path)

    # 背表紙ファイル名、パスを生成
    file_path = path + "/" + shelf_num + "_" + cover_num + ".png"

    # 元画像データを取得
    image_data    = Image.open("img/back_cover_base.png")

    for book in books:

        title       = book["title"]
        contributor = book["contributor"]

        # 描画開始位置の加算マージン（作者）
        margin = 115 * count
        count += 1

        if len(contributor) < 7:
            font_size          = 30
            draw_start_x       = 37 + margin
            draw_start_y       = 7
        elif len(contributor) >= 7:
            # 2行に分割して表示（1行目）
            font_size          = 30
            draw_start_x       = 55 + margin
            draw_start_y       = 7
            contributor_1 = contributor[0:6]
            draw_text(image_data, font_size, contributor_1, draw_start_x, draw_start_y, "#000")

            # 2行に分割して表示（2行目）
            font_size          = 30
            draw_start_x       = 25 + margin
            draw_start_y       = 7
            contributor_2 = contributor[6:len(contributor)]
            draw_text(image_data, font_size, contributor_2, draw_start_x, draw_start_y, "#000")

            contributor = ""

        # 作者を描画
        draw_text(image_data, font_size, contributor, draw_start_x, draw_start_y, "#000")

        if len(title) < 17:
            font_size          = 40
            draw_start_x       = 35 + margin
            draw_start_y       = 120
        elif len(title) >= 17:
            # 2行に分割して表示（1行目）
            font_size          = 40
            draw_start_x       = 58 + margin
            draw_start_y       = 120
            title_1 = title[0:16]
            draw_text(image_data, font_size, title_1, draw_start_x, draw_start_y, "#000")

            # 2行に分割して表示（2行目）
            font_size          = 40
            draw_start_x       = 18 + margin
            draw_start_y       = 120
            title_2 = title[16:len(title)]
            draw_text(image_data, font_size, title_2, draw_start_x, draw_start_y, "#000")

            title = ""

        # タイトルを描画
        draw_text(image_data, font_size, title, draw_start_x, draw_start_y, "#000")

    # 合成した画像の書き出し
    image_data.save(file_path)

# ベース画像に背表紙を描画しファイルを出力(小サイズ)
# title       : タイトル
# contributor : 作者
# shelf_num   : 本棚番号
# cover_num   : 背表紙画像番号
# list_count  : 本情報リストのインデックス
def outputBackCoverLowImage(books, shelf_num, cover_num):
    global file_path_tmp
    count = 0

    # ジャンル名フォルダが存在しなければ作成
    path = "back_cover_low_img/"
    if not os.path.exists(path):
        os.mkdir(path)

    # 背表紙ファイル名、パスを生成
    file_path = path + "/" + shelf_num + "_" + cover_num + "_low.png"

    # 元画像データを取得
    image_data    = Image.open("img/back_cover_base.png")

    for book in books:

        title       = book["title"]
        contributor = book["contributor"]

        # 描画開始位置の加算マージン（作者）
        margin = 115 * count
        count += 1

        if len(contributor) < 7:
            font_size          = 30
            draw_start_x       = 37 + margin
            draw_start_y       = 7
        elif len(contributor) >= 7:
            # 2行に分割して表示（1行目）
            font_size          = 30
            draw_start_x       = 55 + margin
            draw_start_y       = 7
            contributor_1 = contributor[0:6]
            draw_text(image_data, font_size, contributor_1, draw_start_x, draw_start_y, "#000")

            # 2行に分割して表示（2行目）
            font_size          = 30
            draw_start_x       = 25 + margin
            draw_start_y       = 7
            contributor_2 = contributor[6:len(contributor)]
            draw_text(image_data, font_size, contributor_2, draw_start_x, draw_start_y, "#000")

            contributor = ""

        # 作者を描画
        draw_text(image_data, font_size, contributor, draw_start_x, draw_start_y, "#000")

        if len(title) < 17:
            font_size          = 40
            draw_start_x       = 35 + margin
            draw_start_y       = 120
        elif len(title) >= 17:
            # 2行に分割して表示（1行目）
            font_size          = 40
            draw_start_x       = 58 + margin
            draw_start_y       = 120
            title_1 = title[0:16]
            draw_text(image_data, font_size, title_1, draw_start_x, draw_start_y, "#000")

            # 2行に分割して表示（2行目）
            font_size          = 40
            draw_start_x       = 18 + margin
            draw_start_y       = 120
            title_2 = title[16:len(title)]
            draw_text(image_data, font_size, title_2, draw_start_x, draw_start_y, "#000")

            title = ""

        # タイトルを描画
        draw_text(image_data, font_size, title, draw_start_x, draw_start_y, "#000")

    # 合成した画像の書き出し
    image_data.save(file_path)

# メインクラス
def main():
    getBookInfo()

if __name__ == '__main__':
    main()