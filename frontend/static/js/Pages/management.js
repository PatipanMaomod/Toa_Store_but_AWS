
// ================= ฟอร์ม submit=================
document.getElementById("productForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    const id = document.getElementById("editProductForm").dataset.productId;
    const name = document.getElementById("editName").value;
    const price = document.getElementById("editPrice").value;
    const description = document.getElementById("editDesc").value;
    const stock = document.getElementById("editQty").value;
    const files = document.getElementById("editImages").files;

    try {
        // 1) อัปเดตข้อมูล product
        await fetch(`/api/products/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, price, description, stock })
        });

        // 2) ลบรูปที่ถูกเลือก (ถ้ามี)
        if (deletedImages.length > 0) {
            await fetch(`/api/products/img/delete/${id}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ urls: deletedImages }) // ส่งเป็น array
            });
        }

        // 3) ถ้ามีไฟล์ใหม่ → อัปโหลดไป S3 แล้วบันทึกลง DB
        if (files.length > 0) {
            const formData = new FormData();
            for (const f of files) {
                formData.append("files", f);
            }

            const uploadRes = await fetch("/api/upload-multiple-to-s3", {
                method: "POST",
                body: formData
            });
            const uploadData = await uploadRes.json();
            if (uploadData.uploaded) {
                const urls = uploadData.uploaded.map(f => f.url);
                await fetch(`/api/products/img/upload/${id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ image_url_main: urls })
                });
            }
        }

        closeModal();
        showToast("อัปเดตข้อมูลสำเร็จ!", true);
        loadPro_mag();
    } catch (err) {
        console.error("อัปเดตสินค้าล้มเหลว:", err);
        showToast("❌ อัปเดตสินค้าล้มเหลว", false);
    }
});


function showToast(message, success = true) {
    const toast = document.getElementById("toast");
    const toastMessage = document.getElementById("toastMessage");

    toastMessage.textContent = message;
    toast.style.background = success
        ? "linear-gradient(45deg, #4ecdc4, #44a08d)"
        : "linear-gradient(45deg, #ff6b6b, #ffd369)";

    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 2000);
}



// Preview รูปใหม่
document.getElementById("newImages").addEventListener("change", () => {
    const preview = document.getElementById("newPreview");
    preview.innerHTML = "";
    for (const file of document.getElementById("newImages").files) {
        const img = document.createElement("img");
        img.src = URL.createObjectURL(file);
        img.className = "w-20 h-20 object-cover rounded border m-1";
        preview.appendChild(img);
    }
});

function openAddModal() {
    document.getElementById("addProductForm").style.display = "flex";
}

function closeAddModal() {
    document.getElementById("addProductForm").style.display = "none";
    document.getElementById("newProductForm").reset();
    document.getElementById("newPreview   ").innerHTML = "";
}



// Submit ฟอร์มเพิ่มสินค้าใหม่
document.getElementById("newProductForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("newName").value;
    const description = document.getElementById("newDesc").value;
    const price = document.getElementById("newPrice").value;
    const stock = document.getElementById("newQty").value;
    const files = document.getElementById("newImages").files;

    // 1) เพิ่มสินค้าใหม่ (ยังไม่ใส่รูป)
    const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, price, stock })
    });
    const newProduct = await res.json();
    if (!res.ok) throw new Error(newProduct.error || "เพิ่มสินค้าไม่สำเร็จ");

    const newProductId = newProduct.id;  //  ใช้ตัวนี้ต่อไปเลย

    // 2) ถ้ามีไฟล์ → อัปโหลดไป S3
    if (files.length > 0) {
        const formData = new FormData();
        for (const f of files) formData.append("files", f);

        const uploadRes = await fetch("/api/upload-multiple-to-s3", {
            method: "POST",
            body: formData
        });
        const uploadData = await uploadRes.json();

        if (uploadData.uploaded) {
            const urls = uploadData.uploaded.map(f => f.url);

            // 3) เก็บ URL ลง DB
            await fetch(`/api/products/img/upload/${newProductId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ image_url_main: urls })
            });
        }
    }

    closeAddModal();
    showToast("เพิ่มสินค้าใหม่สำเร็จ!", true);
    loadPro_mag(); // โหลดตารางใหม่
});
