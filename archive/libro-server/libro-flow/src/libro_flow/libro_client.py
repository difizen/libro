from uuid import uuid4, UUID
from nbclient import NotebookClient
from nbclient.util import ensure_async, run_sync
import nbformat
import datetime
from nbformat import NotebookNode
from typing import Any, Optional
import json
from pydantic import BaseModel, Field
from traitlets import Callable


def cellStartExecution(cell, **kwargs):
    cell.metadata.execution["shell.execute_reply.started"] = datetime.datetime.now(
        datetime.timezone.utc
    ).isoformat()


class LibroExecution(BaseModel):
    id: UUID = Field(default_factory=uuid4)
    current_index: int = 0
    cell_count: int = 0
    code_cells_executed: int = 0
    start_time: str = ""
    end_time: str = ""
    execute_result_path: str = ""
    execute_record_path: str = ""


class LibroNotebookClient(NotebookClient):
    execution: LibroExecution = LibroExecution()

    def __init__(
        self,
        nb: NotebookNode,
        km=None,
        args: dict | None = None,
        execute_result_path: str | None = None,
        execute_record_path: str | None = None,
        **kw,
    ):
        super().__init__(nb=nb, km=km, **kw)
        if isinstance(args, dict):
            self.args = json.dumps(args)
        else:
            self.args = args
        self.execute_result_path = execute_result_path
        self.execute_record_path = execute_record_path
        self.start_time = None
        self.end_time = None

    on_cell_execute = Callable(
        default_value=cellStartExecution,
        allow_none=True,
    ).tag(config=True)

    async def inspect_execution_result(self):
        assert self.kc is not None
        cell_allows_errors = (not self.force_raise_errors) and (self.allow_errors)
        inspect_msg = await ensure_async(
            self.kc.execute(
                "from libro_flow import inspect_execution_result\n\rinspect_execution_result()",
                store_history=False,
                stop_on_error=not cell_allows_errors,
            )
        )
        # print(inspect_msg)
        # self.kc._async_get_shell_msg(msg_id)
        reply = await self.async_wait_for_reply(inspect_msg)
        if reply is not None:
            print(reply)

    def get_status(self):
        status = self.execution
        return status

    def update_execution(self):
        self.execution = LibroExecution()

    async def async_execute(
        self, reset_kc: bool = False, **kwargs: Any
    ) -> NotebookNode:
        if reset_kc and self.owns_km:
            await self._async_cleanup_kernel()
        self.reset_execution_trackers()

        async with self.async_setup_kernel(**kwargs):
            assert self.kc is not None
            self.log.info("Executing notebook with kernel: %s" % self.kernel_name)
            msg_id = await ensure_async(self.kc.kernel_info())
            info_msg = await self.async_wait_for_reply(msg_id)
            if info_msg is not None:
                if "language_info" in info_msg["content"]:
                    self.nb.metadata["language_info"] = info_msg["content"][
                        "language_info"
                    ]
                else:
                    raise RuntimeError(
                        'Kernel info received message content has no "language_info" key. '
                        "Content is:\n" + str(info_msg["content"])
                    )
            cell_allows_errors = (not self.force_raise_errors) and (self.allow_errors)
            self.start_time = datetime.datetime.now(datetime.timezone.utc)
            self.execution.start_time = self.start_time.isoformat()
            self.nb.metadata["libro_execute_start_time"] = self.start_time.isoformat()
            await ensure_async(
                self.kc.execute(
                    f"__libro_execute_args_dict__={self.args}\n",
                    store_history=False,
                    stop_on_error=not cell_allows_errors,
                )
            )
            if self.execute_result_path is not None:
                await ensure_async(
                    self.kc.execute(
                        f"__libro_execute_result__='{self.execute_result_path}'\n",
                        store_history=False,
                        stop_on_error=not cell_allows_errors,
                    )
                )
                self.execution.execute_result_path = self.execute_result_path
            if self.execute_record_path is not None:
                self.execution.execute_record_path = self.execute_record_path
            self.execution.cell_count = len(self.nb.cells)
            for index, cell in enumerate(self.nb.cells):
                await self.async_execute_cell(
                    cell, index, execution_count=self.code_cells_executed + 1
                )
                self.execution.current_index = index
                self.execution.code_cells_executed = self.code_cells_executed
                try:
                    if cell.metadata.execution is None:
                        cell.metadata.execution = {}
                    cell.metadata.execution["shell.execute_reply.end"] = (
                        datetime.datetime.now(datetime.timezone.utc).isoformat()
                    )
                except:
                    pass
                if self.execute_record_path is not None:
                    with open(self.execute_record_path, "w", encoding="utf-8") as f:
                        nbformat.write(self.nb, f)
            self.set_widgets_metadata()
            self.kc.shutdown()
            # await self.inspect_execution_result()
            self.end_time = datetime.datetime.now(datetime.timezone.utc)
            self.execution.end_time = self.end_time.isoformat()
            self.nb.metadata["libro_execute_end_time"] = self.end_time.isoformat()
            log = None
        return self.nb

    execute = run_sync(async_execute)
